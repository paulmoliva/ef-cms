const AWS = require('aws-sdk');

exports.formatDocketEntryResult = ({ caseMap, hit, sourceUnmarshalled }) => {
  const casePk = hit['_id'].split('_')[0];
  const docketNumber = casePk.replace('case|', ''); // TODO figure out why docket number isn't always on a DocketEntry

  let foundCase = caseMap[docketNumber];

  if (!foundCase) {
    hit.inner_hits['case-mappings'].hits.hits.some(innerHit => {
      const innerHitDocketNumber = innerHit['_source'].docketNumber.S;
      caseMap[innerHitDocketNumber] = innerHit['_source'];

      if (innerHitDocketNumber === docketNumber) {
        foundCase = innerHit['_source'];
        return true;
      }
    });
  }

  if (foundCase) {
    const foundCaseUnmarshalled = AWS.DynamoDB.Converter.unmarshall(foundCase);
    return {
      isCaseSealed: !!foundCaseUnmarshalled.isSealed,
      isDocketEntrySealed: !!sourceUnmarshalled.isSealed,
      ...foundCaseUnmarshalled,
      ...sourceUnmarshalled,
      isSealed: undefined,
    };
  } else {
    return sourceUnmarshalled;
  }
};
