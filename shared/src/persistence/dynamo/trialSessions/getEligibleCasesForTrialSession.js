const client = require('../../dynamodbClientService');

exports.getEligibleCasesForTrialSession = async ({
  applicationContext,
  limit,
  skPrefix,
}) => {
  const mappings = await client.query({
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk',
    },
    ExpressionAttributeValues: {
      ':pk': 'eligible-for-trial-case-catalog',
      ':prefix': skPrefix,
    },
    KeyConditionExpression: '#pk = :pk and begins_with(#sk, :prefix)',
    Limit: limit,
    applicationContext,
  });

  const docketNumbers = mappings.map(metadata => metadata.docketNumber);

  let results;
  try {
    results = await client.batchGet({
      applicationContext,
      keys: docketNumbers.map(docketNumber => ({
        pk: `case|${docketNumber}`,
        sk: `case|${docketNumber}`,
      })),
    });
  } catch (err) {
    const counts = {};
    docketNumbers.forEach(dn => {
      counts[dn] = counts[dn] ? counts[dn] + 1 : 1;
    });
    for (const docketNumber in counts) {
      if (counts[docketNumber] > 1) {
        applicationContext.logger.error(
          `We have duplicate records for ${docketNumber}, ${skPrefix}`,
        );
      }
    }

    throw err;
  }

  const aggregatedResults = [];

  for (let result of results) {
    const caseItems = await applicationContext
      .getPersistenceGateway()
      .getCaseByDocketNumber({
        applicationContext,
        docketNumber: result.docketNumber,
      });

    aggregatedResults.push({
      ...result,
      ...caseItems,
    });
  }

  const afterMapping = docketNumbers.map(docketNumber => ({
    ...aggregatedResults.find(r => docketNumber === r.docketNumber),
  }));

  return afterMapping;
};
