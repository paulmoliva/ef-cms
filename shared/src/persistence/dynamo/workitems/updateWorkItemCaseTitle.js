const client = require('../../dynamodbClientService');

exports.updateWorkItemCaseTitle = ({
  applicationContext,
  caseTitle,
  workItem,
}) =>
  client.update({
    ExpressionAttributeNames: {
      '#caseTitle': 'caseTitle',
    },
    ExpressionAttributeValues: {
      ':caseTitle': caseTitle,
    },
    Key: {
      pk: workItem.pk,
      sk: workItem.sk,
    },
    UpdateExpression: 'SET #caseTitle = :caseTitle',
    applicationContext,
  });
