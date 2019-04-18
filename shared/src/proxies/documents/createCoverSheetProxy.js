const { post } = require('../requests');

/**
 * createCoverSheet
 *
 * @param documentId
 * @param applicationContext
 * @returns {Promise<*>}
 */
exports.createCoverSheet = ({ documentId, applicationContext }) => {
  return post({
    applicationContext,
    endpoint: `/documents/${documentId}/coversheet`,
  });
};
