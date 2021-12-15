const { remove } = require('../requests');

/**
 * deleteAuthCookieInteractor
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @returns {Promise<*>} the promise of the api call
 */
exports.deleteAuthCookieInteractor = applicationContext => {
  return remove({
    applicationContext,
    endpoint: process.env.IS_LOCAL ? '/auth/login' : '/auth/auth/login',
    options: {
      withCredentials: true,
    },
  });
};
