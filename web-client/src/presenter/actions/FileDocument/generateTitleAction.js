import { state } from 'cerebral';

/**
 * Set document title.
 *
 * @param {Object} providers the providers object
 * @param {Object} providers.applicationContext the application context
 * @param {Object} providers.props the cerebral props object
 */
export const generateTitleAction = ({ store, get, applicationContext }) => {
  const documentMetadata = get(state.form);

  let documentTitle = applicationContext.getUseCases().generateDocumentTitle({
    applicationContext,
    documentMetadata,
  });
  store.set(state.form.documentTitle, documentTitle);

  if (documentMetadata.secondaryDocument) {
    documentTitle = applicationContext.getUseCases().generateDocumentTitle({
      applicationContext,
      documentMetadata: documentMetadata.secondaryDocument,
    });
    store.set(state.form.secondaryDocument.documentTitle, documentTitle);
  }

  if (documentMetadata.supportingDocumentMetadata) {
    documentTitle = applicationContext.getUseCases().generateDocumentTitle({
      applicationContext,
      documentMetadata: documentMetadata.supportingDocumentMetadata,
    });
    store.set(
      state.form.supportingDocumentMetadata.documentTitle,
      documentTitle,
    );
  }

  if (documentMetadata.secondarySupportingDocumentMetadata) {
    documentTitle = applicationContext.getUseCases().generateDocumentTitle({
      applicationContext,
      documentMetadata: documentMetadata.secondarySupportingDocumentMetadata,
    });
    store.set(
      state.form.secondarySupportingDocumentMetadata.documentTitle,
      documentTitle,
    );
  }
};