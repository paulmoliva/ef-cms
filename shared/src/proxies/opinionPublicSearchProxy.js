const { get } = require('./requests');
const { omit } = require('lodash');

/**
 * opinionPublicSearchInteractor
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {string} providers.searchParams the search params
 * @returns {Promise<*>} the promise of the api call
 */
exports.opinionPublicSearchInteractor = (
  applicationContext,
  { searchParams },
) => {
  const opinionTypesQuery = searchParams.opinionTypes.join(',');

  return get({
    applicationContext,
    endpoint: '/public-api/opinion-search',
    params: {
      ...omit(searchParams, 'opinionTypes'),
      opinionTypes: opinionTypesQuery,
    },
  });
};
