const {
  applicationContext,
} = require('../../test/createTestApplicationContext');
const {
  MOCK_TRIAL_INPERSON,
  MOCK_TRIAL_REMOTE,
} = require('../../../test/mockTrial');
const {
  setNoticeOfChangeToRemoteProceeding,
} = require('./setNoticeOfChangeToRemoteProceeding');
const { Case } = require('../../entities/cases/Case');
const { getFakeFile } = require('../../test/getFakeFile');
const { MOCK_CASE } = require('../../../test/mockCase');

describe('setNoticeOfChangeToRemoteProceeding', () => {
  const mockDocumentId = '98c6b1c8-1eed-44b6-932a-967af060597a';
  const trialSessionId = '76a5b1c8-1eed-44b6-932a-967af060597a';
  const userId = '85a5b1c8-1eed-44b6-932a-967af060597a';

  const inPersonTrialSession = { ...MOCK_TRIAL_INPERSON, trialSessionId };
  const remoteTrialSession = { ...MOCK_TRIAL_REMOTE, trialSessionId };

  const mockOpenCase = new Case(
    {
      ...MOCK_CASE,
      trialDate: '2019-03-01T21:42:29.073Z',
      trialSessionId,
    },
    { applicationContext },
  );

  beforeEach(() => {
    applicationContext.getUseCaseHelpers().appendPaperServiceAddressPageToPdf =
      jest.fn();

    applicationContext
      .getUseCases()
      .generateNoticeOfChangeToRemoteProceedingInteractor.mockReturnValue(
        getFakeFile,
      );

    applicationContext.getUniqueId.mockReturnValue(mockDocumentId);
  });

  it('should save the generated NORP to persistence', async () => {
    await setNoticeOfChangeToRemoteProceeding(applicationContext, {
      caseEntity: mockOpenCase,
      currentTrialSession: inPersonTrialSession,
      newPdfDoc: getFakeFile,
      newTrialSessionEntity: remoteTrialSession,
      userId,
    });

    expect(
      applicationContext.getPersistenceGateway().saveDocumentFromLambda.mock
        .calls[0][0],
    ).toMatchObject({
      document: getFakeFile,
      key: mockDocumentId,
    });
  });

  it('should create and serve the NORP docket entry on the case', async () => {
    await setNoticeOfChangeToRemoteProceeding(applicationContext, {
      caseEntity: mockOpenCase,
      currentTrialSession: inPersonTrialSession,
      newPdfDoc: getFakeFile,
      newTrialSessionEntity: remoteTrialSession,
      userId,
    });

    const norpDocketEntry =
      applicationContext.getUseCaseHelpers().serveGeneratedNoticesOnCase.mock
        .calls[0][0].noticeDocketEntryEntity;

    expect(norpDocketEntry).toMatchObject({
      docketEntryId: mockDocumentId,
      docketNumber: '101-18',
      documentTitle: 'Notice of Change to Remote Proceeding',
      eventCode: 'NORP',
      isAutoGenerated: true,
      isFileAttached: true,
      servedParties: [
        {
          email: 'petitioner@example.com',
          name: 'Test Petitioner',
        },
      ],
      servedPartiesCode: 'B',
    });
  });
});
