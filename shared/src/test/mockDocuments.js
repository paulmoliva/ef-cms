import { INITIAL_DOCUMENT_TYPES } from '../business/entities/EntityConstants';

exports.MOCK_DOCUMENTS = [
  {
    createdAt: '2018-11-21T20:49:28.192Z',
    docketEntryId: '9de27a7d-7c6b-434b-803b-7655f82d5e07',
    docketNumber: '101-18',
    documentTitle: 'Petition',
    documentType: INITIAL_DOCUMENT_TYPES.petition.documentType,
    eventCode: INITIAL_DOCUMENT_TYPES.petition.eventCode,
    filedBy: 'Test Petitioner',
    filingDate: '2018-03-01T05:00:00.000Z',
    index: 1,
    isFileAttached: true,
    isOnDocketRecord: true,
    processingStatus: 'complete',
    receivedAt: '2018-03-01T05:00:00.000Z',
    userId: '7805d1ab-18d0-43ec-bafb-654e83405416',
  },
  {
    createdAt: '2018-11-21T20:49:28.192Z',
    docketEntryId: 'abc81f4d-1e47-423a-8caf-6d2fdc3d3859',
    docketNumber: '101-18',
    documentTitle: 'Statement of Taxpayer Identification',
    documentType: INITIAL_DOCUMENT_TYPES.stin.documentType,
    eventCode: INITIAL_DOCUMENT_TYPES.stin.eventCode,
    filingDate: '2018-03-01T05:00:00.000Z',
    index: 3,
    isFileAttached: true,
    processingStatus: 'pending',
    receivedAt: '2018-03-01T05:00:00.000Z',
    userId: '7805d1ab-18d0-43ec-bafb-654e83405416',
  },
  {
    createdAt: '2018-11-21T20:49:28.192Z',
    docketEntryId: 'e6b81f4d-1e47-423a-8caf-6d2fdc3d3859',
    docketNumber: '101-18',
    documentTitle: 'Answer',
    documentType: 'Answer',
    eventCode: 'A',
    filedBy: 'Test Petitioner',
    filingDate: '2018-03-01T05:00:00.000Z',
    index: 4,
    isFileAttached: true,
    processingStatus: 'pending',
    receivedAt: '2018-03-01T05:00:00.000Z',
    servedAt: '2019-08-25T05:00:00.000Z',
    servedParties: [
      {
        name: 'Bernard Lowe',
      },
      {
        name: 'IRS',
        role: 'irsSuperuser',
      },
    ],
    userId: '7805d1ab-18d0-43ec-bafb-654e83405416',
  },
  {
    createdAt: '2018-11-21T20:49:28.192Z',
    docketEntryId: 'def81f4d-1e47-423a-8caf-6d2fdc3d3859',
    docketNumber: '101-18',
    documentTitle: 'Proposed Stipulated Decision',
    documentType: 'Proposed Stipulated Decision',
    eventCode: 'PSDE',
    filedBy: 'Test Petitioner',
    filingDate: '2018-03-01T05:00:00.000Z',
    index: 5,
    isFileAttached: true,
    processingStatus: 'pending',
    receivedAt: '2018-03-01T05:00:00.000Z',
    servedAt: '2019-08-25T05:00:00.000Z',
    servedParties: [
      {
        name: 'Bernard Lowe',
      },
      {
        name: 'IRS',
        role: 'irsSuperuser',
      },
    ],
    userId: '7805d1ab-18d0-43ec-bafb-654e83405416',
  },
];
