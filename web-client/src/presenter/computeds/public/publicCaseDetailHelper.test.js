import { applicationContextPublic } from '../../../applicationContextPublic';
import { publicCaseDetailHelper as publicCaseDetailHelperComputed } from './publicCaseDetailHelper';
import { runCompute } from 'cerebral/test';
import { withAppContextDecorator } from '../../../withAppContext';

describe('publicCaseDetailHelper', () => {
  let state;

  const publicCaseDetailHelper = withAppContextDecorator(
    publicCaseDetailHelperComputed,
    applicationContextPublic,
  );
  const {
    DOCUMENT_PROCESSING_STATUS_OPTIONS,
    INITIAL_DOCUMENT_TYPES,
    STIPULATED_DECISION_EVENT_CODE,
    TRANSCRIPT_EVENT_CODE,
  } = applicationContextPublic.getConstants();

  beforeEach(() => {
    state = {
      caseDetail: {
        docketEntries: [],
        docketNumber: '123-45',
      },
    };
  });

  describe('formattedDocketEntriesOnDocketRecord', () => {
    it('should return the formattedDocketEntriesOnDocketRecord as an array', () => {
      const result = runCompute(publicCaseDetailHelper, { state });
      expect(
        Array.isArray(result.formattedDocketEntriesOnDocketRecord),
      ).toBeTruthy();
    });

    it('should return hasDocument false if the document is a minute entry', () => {
      state.caseDetail.docketEntries = [
        {
          description: 'Request for Place of Trial at Flavortown, TN',
          documentType:
            INITIAL_DOCUMENT_TYPES.requestForPlaceOfTrial.documentType,
          eventCode: INITIAL_DOCUMENT_TYPES.requestForPlaceOfTrial.eventCode,
          isMinuteEntry: true,
          isOnDocketRecord: true,
          userId: '02323349-87fe-4d29-91fe-8dd6916d2fda',
        },
      ];

      const result = runCompute(publicCaseDetailHelper, { state });
      expect(result.formattedDocketEntriesOnDocketRecord[0]).toMatchObject({
        description: 'Request for Place of Trial at Flavortown, TN',
        hasDocument: false,
      });
    });

    it('should not display a link for the PMT event code', () => {
      state.caseDetail.docketEntries = [
        {
          docketEntryId: 'ae454c18-be84-4a2b-b055-9046ada4f65d',
          documentTitle: 'PRE-TRIAL MEMORANDUM for Resp. (C/S 5-16-13)',
          documentType: 'Miscellaneous',
          eventCode: 'PMT',
          filedBy: 'See Filings and Proceedings',
          filingDate: '2013-05-16T00:00:00.000-04:00',
          index: 14,
          isFileAttached: true,
          isLegacyServed: true,
          isMinuteEntry: false,
          isOnDocketRecord: true,
          isSealed: false,
          isStricken: false,
          numberOfPages: 5,
          processingStatus: 'complete',
          receivedAt: '2013-05-16T00:00:00.000-04:00',
        },
      ];
      const result = runCompute(publicCaseDetailHelper, { state });

      expect(
        result.formattedDocketEntriesOnDocketRecord[0].showLinkToDocument,
      ).toBeFalsy();
    });

    it('should not show a link for documents not visible to the public', () => {
      state.caseDetail.docketEntries = [
        {
          createdAtFormatted: '04/12/20',
          descriptionDisplay: 'Petition',
          docketEntryId: '596223c1-527b-46b4-98b0-1b10455e9495',
          documentTitle: 'Petition',
          documentType: 'Petition',
          eventCode: 'P',
          filedBy: 'Petr. Hanan Al Hroub',
          filingDate: '2020-04-12T04:00:00.000Z',
          filingsAndProceedings: '',
          index: 1,
          isAvailableToUser: true,
          isCourtIssuedDocument: false,
          isFileAttached: true,
          isInProgress: false,
          isMinuteEntry: false,
          isNotServedDocument: false,
          isOnDocketRecord: true,
          isPaper: true,
          isPetition: true,
          isSealed: false,
          isStatusServed: true,
          isStipDecision: false,
          isStricken: false,
          isTranscript: false,
          numberOfPages: 1,
          processingStatus: 'complete',
          qcWorkItemsCompleted: true,
          receivedAt: '2020-04-12T04:00:00.000Z',
          servedAt: '2020-04-14T19:59:46.671Z',
          servedAtFormatted: '04/14/20',
          servedParties: [{ name: 'Hanan Al Hroub' }],
          servedPartiesCode: 'B',
          showLegacySealed: false,
          showServedAt: true,
        },
        {
          createdAtFormatted: '04/12/20',
          descriptionDisplay:
            'Request for Place of Trial at San Francisco, California',
          docketEntryId: 'af6f67db-3160-4562-ac36-5481ab091952',
          documentTitle:
            'Request for Place of Trial at San Francisco, California',
          documentType: 'Request for Place of Trial',
          eventCode: 'RQT',
          filedBy: 'Petr. Hanan Al Hroub',
          filingDate: '2020-04-12T04:00:00.000Z',
          filingsAndProceedings: '',
          index: 2,
          isAvailableToUser: true,
          isCourtIssuedDocument: false,
          isFileAttached: true,
          isInProgress: false,
          isMinuteEntry: false,
          isNotServedDocument: false,
          isOnDocketRecord: true,
          isPaper: true,
          isPetition: false,
          isSealed: false,
          isStatusServed: true,
          isStipDecision: false,
          isStricken: false,
          isTranscript: false,
          processingStatus: 'complete',
          qcWorkItemsCompleted: true,
          receivedAt: '2020-04-12T04:00:00.000Z',
          servedAt: '2020-04-14T19:59:46.672Z',
          servedAtFormatted: '04/14/20',
          servedParties: [{ name: 'Hanan Al Hroub' }],
          servedPartiesCode: 'B',
          showLegacySealed: false,
          showServedAt: true,
        },
        {
          createdAtFormatted: '04/13/20',
          descriptionDisplay:
            'Order of Dismissal and Decision Entered, Judge Buch',
          docketEntryId: '1f1aa3f7-e2e3-43e6-885d-4ce341588c76',
          docketNumber: '104-20',
          documentTitle: 'Order of Dismissal and Decision Entered, Judge Buch',
          documentType: 'Order of Dismissal and Decision',
          eventCode: 'ODD',
          filingDate: '2020-04-14T03:01:50.746Z',
          filingsAndProceedings: '',
          index: 3,
          isAvailableToUser: true,
          isCourtIssuedDocument: true,
          isFileAttached: true,
          isInProgress: false,
          isMinuteEntry: false,
          isNotServedDocument: false,
          isOnDocketRecord: true,
          isPetition: false,
          isSealed: false,
          isStatusServed: true,
          isStipDecision: false,
          isStricken: false,
          isTranscript: false,
          numberOfPages: 1,
          processingStatus: 'complete',
          qcWorkItemsCompleted: true,
          receivedAt: '2020-04-14T03:01:15.215Z',
          servedAt: '2020-04-14T03:01:50.399Z',
          servedAtFormatted: '04/13/20',
          servedParties: [{ name: 'Hanan Al Hroub' }],
          servedPartiesCode: 'B',
          showLegacySealed: false,
          showServedAt: true,
        },
        {
          createdAtFormatted: '11/25/20',
          descriptionDisplay:
            'Notice of Trial on 12/30/2019 at San Francisco, California',
          docketEntryId: '162d3c72-2a31-4c66-b3f4-efaceb2cf0fd',
          documentTitle:
            'Notice of Trial on 12/30/2019 at San Francisco, California',
          documentType: 'Notice of Trial',
          eventCode: 'NTD',
          filingDate: '2020-11-25T16:03:20.417Z',
          filingsAndProceedings: '',
          index: 4,
          isAvailableToUser: true,
          isCourtIssuedDocument: true,
          isFileAttached: true,
          isInProgress: false,
          isMinuteEntry: false,
          isNotServedDocument: false,
          isOnDocketRecord: true,
          isPetition: false,
          isSealed: false,
          isStatusServed: true,
          isStipDecision: false,
          isStricken: false,
          isTranscript: false,
          numberOfPages: 1,
          processingStatus: 'complete',
          qcWorkItemsCompleted: true,
          receivedAt: '2020-11-25T16:03:20.417Z',
          servedAt: '2020-11-25T16:03:21.375Z',
          servedAtFormatted: '11/25/20',
          servedParties: [
            {
              address1: '123 Teachers Way',
              city: 'Haifa',
              contactId: '0f170690-1e02-4903-b336-e471108a2cd1',
              country: 'Palestine',
              countryType: 'international',
              isAddressSealed: false,
              name: 'Hanan Al Hroub',
              postalCode: '123456',
              sealedAndUnavailable: false,
              serviceIndicator: 'Paper',
            },
          ],
          servedPartiesCode: 'B',
          showLegacySealed: false,
          showServedAt: true,
        },
        {
          createdAtFormatted: '11/25/20',
          descriptionDisplay: 'Standing Pretrial Order',
          docketEntryId: 'a456c942-9d19-491a-b764-e2eac34205b0',
          documentTitle: 'Standing Pretrial Order',
          documentType: 'Standing Pretrial Order',
          eventCode: 'SPTO',
          filingDate: '2020-11-25T16:03:21.363Z',
          filingsAndProceedings: '',
          index: 5,
          isAvailableToUser: true,
          isCourtIssuedDocument: true,
          isFileAttached: true,
          isInProgress: false,
          isMinuteEntry: false,
          isNotServedDocument: false,
          isOnDocketRecord: true,
          isPetition: false,
          isSealed: false,
          isStatusServed: true,
          isStipDecision: false,
          isStricken: false,
          isTranscript: false,
          numberOfPages: 4,
          processingStatus: 'complete',
          qcWorkItemsCompleted: true,
          receivedAt: '2020-11-25T16:03:21.363Z',
          servedAt: '2020-11-25T16:03:21.375Z',
          servedAtFormatted: '11/25/20',
          servedParties: [
            {
              address1: '123 Teachers Way',
              city: 'Haifa',
              contactId: '0f170690-1e02-4903-b336-e471108a2cd1',
              country: 'Palestine',
              countryType: 'international',
              isAddressSealed: false,
              name: 'Hanan Al Hroub',
              postalCode: '123456',
              sealedAndUnavailable: false,
              serviceIndicator: 'Paper',
            },
          ],
          servedPartiesCode: 'B',
          showLegacySealed: false,
          showServedAt: true,
        },
        {
          createdAtFormatted: '11/25/20',
          descriptionDisplay: 'Standing Pretrial Order',
          docketEntryId: '71ac5f88-2316-4670-89bd-3decb99cf3ba',
          documentTitle: 'Standing Pretrial Order',
          documentType: 'Standing Pretrial Order',
          eventCode: 'SPTO',
          filingDate: '2020-11-25T16:03:21.363Z',
          filingsAndProceedings: '',
          index: 6,
          isAvailableToUser: true,
          isCourtIssuedDocument: true,
          isFileAttached: false,
          isInProgress: false,
          isMinuteEntry: false,
          isNotServedDocument: false,
          isOnDocketRecord: true,
          isPetition: false,
          isSealed: false,
          isStatusServed: true,
          isStipDecision: false,
          isStricken: false,
          isTranscript: false,
          numberOfPages: 4,
          processingStatus: 'complete',
          qcWorkItemsCompleted: true,
          receivedAt: '2020-11-25T16:03:21.363Z',
          servedAt: '2020-11-25T16:03:21.375Z',
          servedAtFormatted: '11/25/20',
          servedParties: [
            {
              address1: '123 Teachers Way',
              city: 'Haifa',
              contactId: '0f170690-1e02-4903-b336-e471108a2cd1',
              country: 'Palestine',
              countryType: 'international',
              isAddressSealed: false,
              name: 'Hanan Al Hroub',
              postalCode: '123456',
              sealedAndUnavailable: false,
              serviceIndicator: 'Paper',
            },
          ],
          servedPartiesCode: 'B',
          showLegacySealed: false,
          showServedAt: true,
        },
      ];

      const result = runCompute(publicCaseDetailHelper, { state });

      expect(result.formattedDocketEntriesOnDocketRecord).toMatchObject([
        {
          descriptionDisplay: 'Petition',
          docketEntryId: '596223c1-527b-46b4-98b0-1b10455e9495',
          eventCode: 'P',
          index: 1,
          showLinkToDocument: false,
        },
        {
          descriptionDisplay:
            'Request for Place of Trial at San Francisco, California',
          docketEntryId: 'af6f67db-3160-4562-ac36-5481ab091952',
          eventCode: 'RQT',
          index: 2,
          showLinkToDocument: false,
        },
        {
          descriptionDisplay:
            'Order of Dismissal and Decision Entered, Judge Buch',
          docketEntryId: '1f1aa3f7-e2e3-43e6-885d-4ce341588c76',
          eventCode: 'ODD',
          index: 3,
          showLinkToDocument: true,
        },
        {
          descriptionDisplay:
            'Notice of Trial on 12/30/2019 at San Francisco, California',
          docketEntryId: '162d3c72-2a31-4c66-b3f4-efaceb2cf0fd',
          eventCode: 'NTD', // not in EVENT_CODES_VISIBLE_TO_PUBLIC
          index: 4,
          showLinkToDocument: false,
        },
        {
          descriptionDisplay: 'Standing Pretrial Order',
          docketEntryId: 'a456c942-9d19-491a-b764-e2eac34205b0',
          eventCode: 'SPTO',
          index: 5,
          showLinkToDocument: true,
        },
        {
          descriptionDisplay: 'Standing Pretrial Order',
          docketEntryId: '71ac5f88-2316-4670-89bd-3decb99cf3ba',
          eventCode: 'SPTO',
          index: 6,
          showLinkToDocument: false,
        },
      ]);
    });
  });

  it('should indicate when a case is sealed', () => {
    state.caseDetail.isSealed = true;
    const result = runCompute(publicCaseDetailHelper, { state });
    expect(result.formattedCaseDetail.isCaseSealed).toBeTruthy();
  });

  it('should format docket entries with documents and sort chronologically', () => {
    state.caseDetail.docketEntries = [
      {
        action: 'something',
        createdAt: '2018-11-21T20:49:28.192Z',
        description: 'first record',
        docketEntryId: '8675309b-18d0-43ec-bafb-654e83405411',
        documentTitle: 'Petition',
        documentType: 'Petition',
        eventCode: 'P',
        filingDate: '2018-11-21T20:49:28.192Z',
        index: 4,
        isFileAttached: true,
        isOnDocketRecord: true,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.PENDING,
      },
      {
        additionalInfo: 'additionalInfo!',
        additionalInfo2: 'additional info 2!',
        attachments: true,
        createdAt: '2018-10-21T20:49:28.192Z',
        description: 'second record',
        docketEntryId: '8675309b-28d0-43ec-bafb-654e83405412',
        documentTitle: 'Answer',
        documentType: 'Answer',
        eventCode: 'A',
        filedBy: 'Petrs. Dylan Fowler & Jaquelyn Estes',
        filingDate: '2018-10-21T20:49:28.192Z',
        index: 1,
        isFileAttached: true,
        isOnDocketRecord: true,
        numberOfPages: 0,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.PENDING,
      },
      {
        createdAt: '2018-10-25T20:49:28.192Z',
        description: 'third record',
        docketEntryId: '8675309b-28d0-43ec-bafb-654e83405413',
        documentTitle: 'Order to do something',
        documentType: 'Order',
        eventCode: 'O',
        filingDate: '2018-10-25T20:49:28.192Z',
        index: 3,
        isFileAttached: true,
        isOnDocketRecord: true,
        numberOfPages: 0,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE,
        servedAt: '2018-11-27T20:49:28.192Z',
        status: 'served',
      },
      {
        createdAt: '2018-10-25T20:49:28.192Z',
        description: 'fourth record',
        docketEntryId: '8675309b-28d0-43ec-bafb-654e83405414',
        documentTitle: 'Order to do something else',
        documentType: 'Order',
        eventCode: 'O',
        filingDate: '2018-10-25T20:49:28.192Z',
        index: 2,
        isFileAttached: true,
        isOnDocketRecord: true,
        numberOfPages: 0,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.PENDING,
        signatory: 'abc',
      },
      {
        createdAt: '2018-12-25T20:49:28.192Z',
        description: 'fifth record',
        docketEntryId: '8675309b-28d0-43ec-bafb-654e83405415',
        documentType: 'Request for Place of Trial',
        eventCode: 'RQT',
        filingDate: '2018-12-25T20:49:28.192Z',
        index: 5,
        isFileAttached: true,
        isOnDocketRecord: true,
        numberOfPages: 0,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE,
      },
      {
        createdAt: '2018-12-25T20:49:28.192Z',
        description: 'sixth record',
        docketEntryId: 'e47e365d-6349-4d23-98b4-421efb4d8007',
        documentType: 'Transcript',
        eventCode: TRANSCRIPT_EVENT_CODE,
        filingDate: '2018-12-25T20:49:28.192Z',
        index: 6,
        isFileAttached: true,
        isOnDocketRecord: true,
        numberOfPages: 0,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE,
        servedAt: '2018-11-27T20:49:28.192Z',
      },
      {
        createdAt: '2019-12-24T20:49:28.192Z',
        description: 'seventh record',
        docketEntryId: 'e47e365d-6349-4d23-98b4-421efb4d8009',
        documentType: 'Transcript',
        eventCode: TRANSCRIPT_EVENT_CODE,
        filingDate: '2019-12-24T20:49:28.192Z',
        index: 7,
        isFileAttached: true,
        isOnDocketRecord: true,
        isStricken: true,
        numberOfPages: 0,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE,
        servedAt: '2019-12-24T21:49:28.192Z',
      },
      {
        createdAt: '2019-12-24T20:49:28.192Z',
        description: 'eighth record',
        docketEntryId: 'd1eb1db6-25fd-4683-931b-a2f4bc366788',
        documentType: 'Stipulated Decision',
        eventCode: STIPULATED_DECISION_EVENT_CODE,
        filingDate: '2019-12-24T20:49:28.192Z',
        index: 8,
        isFileAttached: true,
        isOnDocketRecord: true,
        isStricken: false,
        numberOfPages: 0,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE,
        servedAt: '2019-12-24T21:49:28.192Z',
      },
      {
        createdAt: '2019-12-25T20:49:28.192Z',
        description: 'ninth record',
        docketEntryId: '5d742def-7011-4f90-ab2c-5f00c052f7fa',
        documentTitle: 'Record on Appeal',
        documentType: 'Record on Appeal',
        eventCode: 'ROA',
        filingDate: '2019-12-25T20:49:28.192Z',
        index: 9,
        isFileAttached: true,
        isOnDocketRecord: true,
        isStricken: false,
        numberOfPages: 0,
        processingStatus: DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE,
      },
    ];
    const result = runCompute(publicCaseDetailHelper, { state });
    expect(result.formattedDocketEntriesOnDocketRecord).toMatchObject([
      {
        createdAtFormatted: '10/21/18',
        descriptionDisplay: 'Answer',
        docketEntryId: '8675309b-28d0-43ec-bafb-654e83405412',
        eventCode: 'A',
        filedBy: 'Petrs. Dylan Fowler & Jaquelyn Estes',
        filingsAndProceedingsWithAdditionalInfo:
          ' additionalInfo! (Attachment(s)) additional info 2!',
        hasDocument: true,
        index: 1,
        isPaper: undefined,
        servedAtFormatted: undefined,
        servedPartiesCode: '',
        showDocumentDescriptionWithoutLink: true,
        showLinkToDocument: false,
        showNotServed: true,
        showServed: false,
        signatory: undefined,
      },
      {
        createdAtFormatted: '10/25/18',
        description: 'third record',
        descriptionDisplay: 'Order to do something',
        docketEntryId: '8675309b-28d0-43ec-bafb-654e83405413',
        eventCode: 'O',
        filedBy: undefined,
        filingsAndProceedingsWithAdditionalInfo: '',
        hasDocument: true,
        index: 3,
        isPaper: undefined,
        servedAtFormatted: '11/27/18',
        servedPartiesCode: '',
        showDocumentDescriptionWithoutLink: false,
        showLinkToDocument: true,
        showNotServed: false,
        showServed: true,
        signatory: undefined,
      },
      {
        action: 'something',
        createdAtFormatted: '11/21/18',
        description: 'first record',
        descriptionDisplay: 'Petition',
        docketEntryId: '8675309b-18d0-43ec-bafb-654e83405411',
        eventCode: 'P',
        filedBy: undefined,
        filingsAndProceedingsWithAdditionalInfo: '',
        hasDocument: true,
        index: 4,
        isPaper: undefined,
        servedAtFormatted: undefined,
        servedPartiesCode: '',
        showDocumentDescriptionWithoutLink: true,
        showLinkToDocument: false,
        showNotServed: true,
        showServed: false,
        signatory: undefined,
      },
      {
        action: undefined,
        createdAtFormatted: '12/25/18',
        description: 'fifth record',
        descriptionDisplay: 'fifth record',
        docketEntryId: '8675309b-28d0-43ec-bafb-654e83405415',
        eventCode: 'RQT',
        filedBy: undefined,
        filingsAndProceedingsWithAdditionalInfo: '',
        hasDocument: true,
        index: 5,
        isPaper: undefined,
        servedAtFormatted: undefined,
        servedPartiesCode: '',
        showDocumentDescriptionWithoutLink: true,
        showLinkToDocument: false,
        showNotServed: true,
        showServed: false,
        signatory: undefined,
      },
      {
        action: undefined,
        createdAtFormatted: '12/25/18',
        description: 'sixth record',
        descriptionDisplay: 'sixth record',
        docketEntryId: 'e47e365d-6349-4d23-98b4-421efb4d8007',
        eventCode: TRANSCRIPT_EVENT_CODE,
        filedBy: undefined,
        filingsAndProceedingsWithAdditionalInfo: '',
        hasDocument: true,
        index: 6,
        isPaper: undefined,
        servedAtFormatted: '11/27/18',
        servedPartiesCode: '',
        showDocumentDescriptionWithoutLink: true,
        showLinkToDocument: false,
        showNotServed: false,
        showServed: true,
        signatory: undefined,
      },
      {
        createdAtFormatted: '12/24/19',
        description: 'seventh record',
        descriptionDisplay: 'seventh record',
        docketEntryId: 'e47e365d-6349-4d23-98b4-421efb4d8009',
        eventCode: TRANSCRIPT_EVENT_CODE,
        filedBy: undefined,
        filingsAndProceedingsWithAdditionalInfo: '',
        hasDocument: true,
        index: 7,
        isPaper: undefined,
        servedAtFormatted: '12/24/19',
        servedPartiesCode: '',
        showDocumentDescriptionWithoutLink: true,
        showLinkToDocument: false,
        showNotServed: false,
        showServed: true,
        signatory: undefined,
      },
      {
        createdAtFormatted: '12/24/19',
        description: 'eighth record',
        descriptionDisplay: 'eighth record',
        docketEntryId: 'd1eb1db6-25fd-4683-931b-a2f4bc366788',
        eventCode: STIPULATED_DECISION_EVENT_CODE,
        filingsAndProceedingsWithAdditionalInfo: '',
        hasDocument: true,
        index: 8,
        isStricken: false,
        servedAtFormatted: '12/24/19',
        showDocumentDescriptionWithoutLink: true,
        showLinkToDocument: false,
        showNotServed: false,
        showServed: true,
      },
      {
        createdAtFormatted: '12/25/19',
        description: 'ninth record',
        descriptionDisplay: 'Record on Appeal',
        docketEntryId: '5d742def-7011-4f90-ab2c-5f00c052f7fa',
        eventCode: 'ROA',
        filedBy: undefined,
        filingsAndProceedingsWithAdditionalInfo: '',
        hasDocument: true,
        index: 9,
        showDocumentDescriptionWithoutLink: true,
        showLinkToDocument: false,
        showNotServed: false,
        showServed: false,
      },
      {
        createdAtFormatted: undefined,
        description: 'fourth record',
        descriptionDisplay: 'Order to do something else',
        docketEntryId: '8675309b-28d0-43ec-bafb-654e83405414',
        eventCode: 'O',
        filedBy: undefined,
        filingsAndProceedingsWithAdditionalInfo: '',
        hasDocument: true,
        index: 2,
        isPaper: undefined,
        servedAtFormatted: undefined,
        servedPartiesCode: '',
        showDocumentDescriptionWithoutLink: true,
        showLinkToDocument: false,
        showNotServed: true,
        showServed: false,
        signatory: 'abc',
      },
    ]);
  });
});
