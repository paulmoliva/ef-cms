const {
  COURT_ISSUED_EVENT_CODES,
  INITIAL_DOCUMENT_TYPES,
  MINUTE_ENTRIES_MAP,
  UNSERVABLE_EVENT_CODES,
} = require('../entities/EntityConstants');

const getIsInitialFilingType = docketRecordEntry => {
  const INITIAL_DOCUMENT_EVENT_CODES = Object.keys(INITIAL_DOCUMENT_TYPES).map(
    key => INITIAL_DOCUMENT_TYPES[key].eventCode,
  );

  return INITIAL_DOCUMENT_EVENT_CODES.includes(docketRecordEntry.eventCode);
};

const getIsMinuteEntry = docketRecordEntry => {
  const MINUTE_ENTRIES_EVENT_CODES = Object.keys(MINUTE_ENTRIES_MAP).map(
    key => MINUTE_ENTRIES_MAP[key].eventCode,
  );

  return MINUTE_ENTRIES_EVENT_CODES.includes(docketRecordEntry.eventCode);
};

const getIsCourtIssued = docketRecordEntry =>
  COURT_ISSUED_EVENT_CODES.map(item => item.eventCode).includes(
    docketRecordEntry.eventCode,
  );

const getDocumentForEntry = (caseDetail, docketRecordEntry) =>
  docketRecordEntry.documentId &&
  caseDetail.docketEntries.find(
    doc => doc.documentId === docketRecordEntry.documentId,
  );

const getIsUnservable = docketRecordEntry =>
  UNSERVABLE_EVENT_CODES.includes(docketRecordEntry.eventCode);

/**
 * determines if a docket record entry should get an index
 *
 * @param {string} applicationContext the application context
 * @param {string} caseDetail the case detail object
 * @param {object} docketRecordEntry the docket record entry
 * @param {object} documentEntity the document entity
 * @returns {boolean} true if a given entry should have an index applied or false otherwise
 */
const shouldGenerateDocketRecordIndex = ({
  caseDetail,
  docketRecordEntry,
  documentEntity,
}) => {
  const entityToUse = docketRecordEntry || documentEntity;

  if (!entityToUse || (entityToUse && entityToUse.index)) {
    return false; // an index does not need to be generated
  }

  const isMinuteEntry = getIsMinuteEntry(entityToUse);
  const isInitialFilingType = getIsInitialFilingType(entityToUse);
  const isCourtIssued = getIsCourtIssued(entityToUse);
  const isUnservable = getIsUnservable(entityToUse);

  if (!isInitialFilingType && !isMinuteEntry && !entityToUse.documentId) {
    return false;
  }

  const document =
    documentEntity || getDocumentForEntry(caseDetail, entityToUse);

  if (document && !document.isPaper && !isCourtIssued) {
    return true;
  }

  if (isInitialFilingType) {
    if (entityToUse.eventCode === INITIAL_DOCUMENT_TYPES.petition.eventCode) {
      return true;
    } else {
      const petitionDocument = caseDetail.docketEntries.find(
        d => d.eventCode === INITIAL_DOCUMENT_TYPES.petition.eventCode,
      );
      // if the petition has a servedAt, then this non-petition initial document is being added after the fact (not filed at the same time)
      if (petitionDocument.servedAt) {
        // if this initial document is being served, it should have an index
        return document && !!document.servedAt;
      } else {
        return true;
      }
    }
  }

  return isUnservable || isMinuteEntry || (document && !!document.servedAt);
};

exports.shouldGenerateDocketRecordIndex = shouldGenerateDocketRecordIndex;
