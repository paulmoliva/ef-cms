import { state } from 'cerebral';

/**
 * get the pdf file and pdf blob url from the passed in htmlString
 *
 * @param {object} providers the providers object
 * @param {Function} providers.get the cerebral get function
 * @param {object} providers.props the passed in props
 * @returns {object} pdfFile, pdfUrl
 */
export const getPdfPreviewUrlAction = async ({
  applicationContext,
  get,
  props,
}) => {
  const { htmlString } = props;
  const documentTitle = get(state.form.documentTitle);

  if (!htmlString) {
    throw new Error('No markup found in documentHtml');
  }
  let docketNumberWithSuffix = get(
    state.formattedCaseDetail.docketNumberWithSuffix,
  );

  const pdfBlob = await applicationContext
    .getUseCases()
    .createCourtIssuedOrderPdfFromHtmlInteractor({
      applicationContext,
      docketNumberWithSuffix,
      htmlString,
    });

  const pdfUrl = window.URL.createObjectURL(pdfBlob);
  const pdfFile = new File([pdfBlob], documentTitle);

  return { pdfFile, pdfUrl };
};
