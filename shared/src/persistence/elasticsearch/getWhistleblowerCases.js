const {
  DOCKET_NUMBER_SUFFIXES,
} = require('../../business/entities/EntityConstants');
const { omit } = require('lodash');
const { search } = require('./searchClient');

/**
 * getWhistleBlowerReport
 *
 * Fetch all of the cases that are WhistleBlower cases. These can be queried
 * by the docket number suffix. Usually a `W` or whatever is defined in
 * entity Constants
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @returns {object} the docket entries
 */
exports.getWhistleBlowerReport = async ({ applicationContext }) => {
  const query = {
    term: {
      'docketNumberSuffix.S': DOCKET_NUMBER_SUFFIXES.WHISTLEBLOWER,
    },
  };

  const { results } = await search({
    applicationContext,
    searchParameters: {
      body: {
        _source: ['pk', 'docketNumber', 'status', 'sk'],
        query,
        size: 5000,
        sort: [{ 'receivedAt.S': { order: 'asc' } }],
      },
      index: 'efcms-case',
    },
  });

  return results.map(result => omit(result, ['_score']));
};
