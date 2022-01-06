const createApplicationContext = require('../../../../src/applicationContext');
const applicationContext = createApplicationContext({});

const migrateItems = async (items, documentClient) => {
  const itemsAfter = [];
  for (const item of items) {
    if (item.pk.startsWith('user|') && item.sk.startsWith('case|')) {
      const userId = item.pk.split('|')[1];
      const userRecord = await documentClient
        .get({
          Key: {
            pk: `user|${userId}`,
            sk: `user|${userId}`,
          },
          TableName: process.env.SOURCE_TABLE,
        })
        .promise()
        .then(res => {
          return res.Item;
        });

      if (
        !['privatePractitioner', 'irsPractitioner'].includes(userRecord.role)
      ) {
        itemsAfter.push(item);
      } else {
        const docketNumber = item.sk.split('|')[1];
        const practitionerType = userRecord.role;

        let casePractitionerRecord = await documentClient
          .get({
            Key: {
              pk: `case|${docketNumber}`,
              sk: `${practitionerType}|${userId}`,
            },
            TableName: process.env.SOURCE_TABLE,
          })
          .promise()
          .then(res => {
            return res.Item;
          });

        if (casePractitionerRecord) {
          itemsAfter.push(item);
        } else {
          applicationContext.logger.info(
            'Failed to find case practitioner record',
            {
              pk: `case|${docketNumber}`,
              sk: `${practitionerType}|${userId}`,
            },
          );

          let entityName =
            practitionerType === 'privatePractitioner'
              ? 'PrivatePractitioner'
              : 'IrsPractitioner';

          casePractitionerRecord = {
            barNumber: userRecord.barNumber,
            contact: userRecord.contact,
            email: userRecord.email,
            entityName,
            name: userRecord.name,
            pk: `case|${docketNumber}`,
            role: userRecord.role,
            section: userRecord.section,
            serviveIndicator: userRecord.serviceIndicator,
            sk: `${practitionerType}|${userId}`,
            userId,
          };

          applicationContext.logger.info(
            'Created missing case practitioner record',
            casePractitionerRecord,
          );

          itemsAfter.push(item);
          itemsAfter.push(casePractitionerRecord);
        }
      }
    } else {
      itemsAfter.push(item);
    }
  }
  return itemsAfter;
};

exports.migrateItems = migrateItems;
