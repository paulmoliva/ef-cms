const {
  aggregatePartiesForService,
} = require('../../utilities/aggregatePartiesForService');
const {
  DOCUMENT_PROCESSING_STATUS_OPTIONS,
  SYSTEM_GENERATED_DOCUMENT_TYPES,
} = require('../../entities/EntityConstants');
const { DocketEntry } = require('../../entities/DocketEntry');

/**
 * setNoticeOfChangeToInPersonProceeding
 *
 * @param {object} applicationContext the application context
 * @param {object} providers the providers object
 * @param {object} providers.caseEntity the case data
 * @param {object} providers.currentTrialSession the old trial session data
 * @param {object} providers.newPdfDoc the new PDF contents to be appended
 * @param {object} providers.newTrialSessionEntity the new trial session data
 * @param {object} providers.PDFDocument the PDF document to append to
 * @param {object} providers.userId the user ID
 * @returns {Promise<void>} the created trial session
 */
exports.setNoticeOfChangeToInPersonProceeding = async (
  applicationContext,
  { caseEntity, newPdfDoc, newTrialSessionEntity, PDFDocument, userId },
) => {
  const trialSessionInformation = {
    address1: newTrialSessionEntity.address1,
    address2: newTrialSessionEntity.address2,
    chambersPhoneNumber: newTrialSessionEntity.chambersPhoneNumber,
    city: newTrialSessionEntity.city,
    courthouseName: newTrialSessionEntity.courthouseName,
    judgeName: newTrialSessionEntity.judge.name,
    startDate: newTrialSessionEntity.startDate,
    startTime: newTrialSessionEntity.startTime,
    state: newTrialSessionEntity.state,
  };

  const notice = await applicationContext
    .getUseCaseHelpers()
    .generateNoticeOfChangeToInPersonProceeding(applicationContext, {
      docketNumber: caseEntity.docketNumber,
      trialSessionInformation,
    });

  const docketEntryId = applicationContext.getUniqueId();

  await applicationContext.getPersistenceGateway().saveDocumentFromLambda({
    applicationContext,
    document: notice,
    key: docketEntryId,
  });

  const noticeOfChangeToInPersonProceedingDocketEntry = new DocketEntry(
    {
      date: newTrialSessionEntity.startDate,
      docketEntryId,
      documentTitle:
        SYSTEM_GENERATED_DOCUMENT_TYPES.noticeOfChangeToInPersonProceeding
          .documentTitle,
      documentType:
        SYSTEM_GENERATED_DOCUMENT_TYPES.noticeOfChangeToInPersonProceeding
          .documentType,
      eventCode:
        SYSTEM_GENERATED_DOCUMENT_TYPES.noticeOfChangeToInPersonProceeding
          .eventCode,
      isAutoGenerated: true,
      isFileAttached: true,
      isOnDocketRecord: true,
      processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE,
      signedAt: applicationContext.getUtilities().createISODateString(),
      trialLocation: newTrialSessionEntity.trialLocation,
      userId,
    },
    { applicationContext },
  );

  noticeOfChangeToInPersonProceedingDocketEntry.numberOfPages =
    await applicationContext.getUseCaseHelpers().countPagesInDocument({
      applicationContext,
      docketEntryId:
        noticeOfChangeToInPersonProceedingDocketEntry.docketEntryId,
    });

  caseEntity.addDocketEntry(noticeOfChangeToInPersonProceedingDocketEntry);
  const servedParties = aggregatePartiesForService(caseEntity);

  noticeOfChangeToInPersonProceedingDocketEntry.setAsServed(servedParties.all);

  await applicationContext.getUseCaseHelpers().serveGeneratedNoticesOnCase({
    PDFDocument,
    applicationContext,
    caseEntity,
    newPdfDoc,
    noticeDocketEntryEntity: noticeOfChangeToInPersonProceedingDocketEntry,
    noticeDocumentPdfData: notice,
    servedParties,
  });
};
