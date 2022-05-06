const {
  applicationContext,
} = require('../../test/createTestApplicationContext');
const { getUserCaseNoteInteractor } = require('./getUserCaseNoteInteractor');
const { MOCK_CASE } = require('../../../test/mockCase');
const { omit } = require('lodash');
const { ROLES } = require('../../entities/EntityConstants');
const { UnauthorizedError } = require('../../../errors/errors');
const { User } = require('../../entities/User');

describe('Get case note', () => {
  const MOCK_NOTE = {
    docketNumber: MOCK_CASE.docketNumber,
    notes: 'something',
    userId: 'd7d90c05-f6cd-442c-a168-202db587f16f',
  };

  const mockUnauthorizedUser = {
    role: 'unauthorizedRole',
    userId: 'unauthorizedUser',
  };

  const mockJudge = {
    role: ROLES.judge,
    section: 'colvinChambers',
    userId: 'd7d90c05-f6cd-442c-a168-202db587f16f',
  };

  it('throws error if user is unauthorized', async () => {
    applicationContext.getCurrentUser.mockReturnValue(mockUnauthorizedUser);
    applicationContext
      .getPersistenceGateway()
      .getUserCaseNote.mockReturnValue({});

    applicationContext.getUseCaseHelpers.mockReturnValue({
      getJudgeInSectionHelper: () => null,
    });

    await expect(
      getUserCaseNoteInteractor(applicationContext, {
        docketNumber: MOCK_NOTE.docketNumber,
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('throws an error if the entity returned from persistence is invalid', async () => {
    applicationContext.getCurrentUser.mockReturnValue(new User(mockJudge));
    applicationContext
      .getPersistenceGateway()
      .getUserCaseNote.mockResolvedValue(omit(MOCK_NOTE, 'userId'));
    applicationContext.getUseCaseHelpers.mockReturnValue({
      getJudgeInSectionHelper: () => mockJudge,
    });

    await expect(
      getUserCaseNoteInteractor(applicationContext, {
        docketNumber: MOCK_NOTE.docketNumber,
      }),
    ).rejects.toThrow('The UserCaseNote entity was invalid');
  });

  it('correctly returns data from persistence if a judgeUser exists', async () => {
    applicationContext.getCurrentUser.mockReturnValue(new User(mockJudge));
    applicationContext
      .getPersistenceGateway()
      .getUserCaseNote.mockResolvedValue(MOCK_NOTE);

    applicationContext.getUseCaseHelpers.mockReturnValue({
      getJudgeInSectionHelper: () => mockJudge,
    });

    const result = await getUserCaseNoteInteractor(applicationContext, {
      docketNumber: MOCK_NOTE.docketNumber,
    });

    expect(result).toMatchObject(MOCK_NOTE);
  });

  it('correctly returns data from persistence for the current user if a judgeUser does not exist', async () => {
    applicationContext.getCurrentUser.mockReturnValue(new User(mockJudge));
    applicationContext
      .getPersistenceGateway()
      .getUserCaseNote.mockResolvedValue(MOCK_NOTE);

    applicationContext.getUseCaseHelpers.mockReturnValue({
      getJudgeInSectionHelper: () => null,
    });

    const result = await getUserCaseNoteInteractor(applicationContext, {
      docketNumber: MOCK_NOTE.docketNumber,
    });

    expect(result).toMatchObject({ ...MOCK_NOTE, userId: mockJudge.userId });
  });

  it('does not return anything if nothing is returned from persistence', async () => {
    applicationContext.getCurrentUser.mockReturnValue(new User(mockJudge));
    applicationContext
      .getPersistenceGateway()
      .getUserCaseNote.mockReturnValue(null);
    applicationContext.getUseCaseHelpers.mockReturnValue({
      getJudgeInSectionHelper: () => mockJudge,
    });

    const result = await getUserCaseNoteInteractor(applicationContext, {
      docketNumber: MOCK_NOTE.docketNumber,
    });

    expect(result).toEqual(undefined);
  });
});
