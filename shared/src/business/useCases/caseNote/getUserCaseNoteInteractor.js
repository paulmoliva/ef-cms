const {
  isAuthorized,
  ROLE_PERMISSIONS,
} = require('../../../authorization/authorizationClientService');
const { UnauthorizedError } = require('../../../errors/errors');
const { User } = require('../../entities/User');
const { UserCaseNote } = require('../../entities/notes/UserCaseNote');

/**
 * getUserCaseNoteInteractor
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {string} providers.docketNumber the docket number of the case to get notes for
 * @returns {object} the case note object if one is found
 */
exports.getUserCaseNoteInteractor = async (
  applicationContext,
  { docketNumber },
) => {
  const user = applicationContext.getCurrentUser();

  if (!isAuthorized(user, ROLE_PERMISSIONS.TRIAL_SESSION_WORKING_COPY)) {
    throw new UnauthorizedError('Unauthorized');
  }

  const rawUser = await applicationContext.getPersistenceGateway().getUserById({
    applicationContext,
    userId: user.userId,
  });

  const userEntity = new User(rawUser);

  let { userId } = userEntity;

  if (userEntity.isChambersUser()) {
    const judgeUser = await applicationContext
      .getUseCaseHelpers()
      .getJudgeInSectionHelper(applicationContext, {
        section: userEntity.section,
      });
    if (judgeUser) {
      ({ userId } = judgeUser);
    }
  }

  const caseNote = await applicationContext
    .getPersistenceGateway()
    .getUserCaseNote({
      applicationContext,
      docketNumber,
      userId,
    });

  if (caseNote) {
    return new UserCaseNote(caseNote).validate().toRawObject();
  }
};
