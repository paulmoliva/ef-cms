import { state } from 'cerebral';

export const messageDocumentHelper = (get, applicationContext) => {
  const { USER_ROLES } = applicationContext.getConstants();
  const user = applicationContext.getCurrentUser();
  const attachmentDocumentToDisplay = get(state.attachmentDocumentToDisplay);
  const caseDetail = get(state.caseDetail);
  const documentIsSigned =
    attachmentDocumentToDisplay && !!attachmentDocumentToDisplay.signedAt;

  const isDocumentOnDocketRecord = caseDetail.docketRecord.find(
    docketEntry => docketEntry.documentId === document.documentId,
  );

  const isInternalUser = applicationContext
    .getUtilities()
    .isInternalUser(user.role);

  const isDocketPetitionsClerkRole = [
    USER_ROLES.clerkOfCourt,
    USER_ROLES.docketClerk,
    USER_ROLES.petitionsClerk,
  ].includes(user.role);

  const showAddDocketEntryButtonForRole = isDocketPetitionsClerkRole;
  const showEditButtonForRole = isInternalUser;
  const showApplyEditSignatureButtonForRole = isInternalUser;

  const showAddDocketEntryButtonForDocument = !isDocumentOnDocketRecord;
  const showApplySignatureButtonForDocument =
    !documentIsSigned && !isDocumentOnDocketRecord;
  const showEditSignatureButtonForDocument =
    documentIsSigned && !isDocumentOnDocketRecord;
  const showEditButtonForDocument = !isDocumentOnDocketRecord;

  return {
    showAddDocketEntryButton:
      showAddDocketEntryButtonForRole && showAddDocketEntryButtonForDocument,
    showApplySignatureButton:
      showApplyEditSignatureButtonForRole &&
      showApplySignatureButtonForDocument,
    showEditButton: showEditButtonForRole && showEditButtonForDocument,
    showEditSignatureButton:
      showApplyEditSignatureButtonForRole && showEditSignatureButtonForDocument,
  };
};
