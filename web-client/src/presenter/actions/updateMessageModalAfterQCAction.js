import { state } from 'cerebral';

/**
 * updates the message form data's attachments field based on the document being QCd
 *
 * @param {object} providers the providers object
 * @param {object} providers.get the get function to retrieve values from state
 * @param {object} providers.props the cerebral props object
 * @param {object} providers.store the cerebral store object
 */
export const updateMessageModalAfterQCAction = ({
  applicationContext,
  get,
  store,
}) => {
  store.set(state.modal.validationErrors, {});

  const docketEntry = get(state.form);
  const documentId = get(state.docketEntryId);

  const generatedDocumentTitle = applicationContext
    .getUtilities()
    .getDocumentTitleWithAdditionalInfo({ docketEntry });

  store.set(state.modal.form.subject, generatedDocumentTitle);

  store.set(state.modal.form.attachments, [
    {
      documentId,
      documentTitle: generatedDocumentTitle,
    },
  ]);
};
