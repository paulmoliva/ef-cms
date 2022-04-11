const {
  CASE_STATUS_TYPES,
  DOCKET_NUMBER_SUFFIXES,
  DOCKET_SECTION,
} = require('./EntityConstants');
const { applicationContext } = require('../test/createTestApplicationContext');
const { OutboxItem } = require('./OutboxItem');

describe('OutboxItem', () => {
  describe('isValid', () => {
    it('should throw an error if app context is not passed in', () => {
      expect(() => new OutboxItem({}, {})).toThrow();
    });

    it('Creates a valid OutboxItem', () => {
      const outboxItem = new OutboxItem(
        {
          caseStatus: CASE_STATUS_TYPES.new,
          caseTitle: 'Johnny Joe Jacobson',
          docketEntry: {},
          docketNumber: '101-18',
          docketNumberSuffix: DOCKET_NUMBER_SUFFIXES.SMALL,
          section: DOCKET_SECTION,
        },
        { applicationContext },
      );
      expect(outboxItem.isValid()).toBeTruthy();
    });
    it('should fail validation when fields are missing', () => {
      const outboxItem = new OutboxItem(
        {
          assigneeId: '8b4cd447-6278-461b-b62b-d9e357eea62c',
          assigneeName: 'bob',
          caseStatus: CASE_STATUS_TYPES.new,
          caseTitle: 'Johnny Joe Jacobson',
          docketNumberSuffix: DOCKET_NUMBER_SUFFIXES.SMALL,
        },
        { applicationContext },
      );
      expect(outboxItem.isValid()).toBeFalsy();
    });
  });

  it('is set high priority if case is calendared or overridden', () => {
    let outboxItem = new OutboxItem(
      {
        caseStatus: CASE_STATUS_TYPES.new,
        caseTitle: 'Johnny Joe Jacobson',
        docketEntry: {},
        docketNumber: '101-18',
        docketNumberSuffix: DOCKET_NUMBER_SUFFIXES.SMALL,
        section: DOCKET_SECTION,
      },
      { applicationContext },
    );
    expect(outboxItem.highPriority).toBe(false);

    outboxItem = new OutboxItem(
      {
        caseStatus: CASE_STATUS_TYPES.calendared,
        caseTitle: 'Johnny Joe Jacobson',
        docketEntry: {},
        docketNumber: '101-18',
        docketNumberSuffix: DOCKET_NUMBER_SUFFIXES.SMALL,
        section: DOCKET_SECTION,
      },
      { applicationContext },
    );
    expect(outboxItem.highPriority).toBe(true);

    outboxItem = new OutboxItem(
      {
        caseStatus: CASE_STATUS_TYPES.new,
        caseTitle: 'Johnny Joe Jacobson',
        docketEntry: {},
        docketNumber: '101-18',
        docketNumberSuffix: DOCKET_NUMBER_SUFFIXES.SMALL,
        highPriority: true,
        section: DOCKET_SECTION,
      },
      { applicationContext },
    );
    expect(outboxItem.highPriority).toBe(true);
  });

  it('Creates a workItem containing a docketEntry with only the picked fields', () => {
    const outboxItem = new OutboxItem(
      {
        caseStatus: CASE_STATUS_TYPES.new,
        caseTitle: 'Johnny Joe Jacobson',
        docketEntry: {
          createdAt: '2018-11-21T20:49:28.192Z',
          docketEntryId: 'def81f4d-1e47-423a-8caf-6d2fdc3d3859',
          docketNumber: '101-18',
          documentTitle: 'Proposed Stipulated Decision',
          documentType: 'Proposed Stipulated Decision',
          editState: {},
          eventCode: 'PSDE',
          filedBy: 'Test Petitioner',
          filingDate: '2018-03-01T00:01:00.000Z',
          index: 5,
          isFileAttached: true,
          isLegacyServed: false,
          processingStatus: 'pending',
          receivedAt: '2018-03-01T00:01:00.000Z',
          servedAt: '2019-08-25T05:00:00.000Z',
        },
        docketNumber: '101-18',
        docketNumberSuffix: DOCKET_NUMBER_SUFFIXES.SMALL,
        section: DOCKET_SECTION,
      },
      { applicationContext },
    );
    expect(outboxItem.docketEntry.docketNumber).toBeUndefined();
    expect(outboxItem.docketEntry.editState).toBeUndefined();
    expect(outboxItem.docketEntry.processingStatus).toBeUndefined();
    expect(outboxItem.docketEntry.createdAt).toBeUndefined();
    expect(outboxItem.docketEntry.documentTitle).toBeUndefined();
    expect(outboxItem.docketEntry.filingDate).toBeUndefined();
    expect(outboxItem.docketEntry.index).toBeUndefined();
    expect(outboxItem.docketEntry.processingStatus).toBeUndefined();
    expect(outboxItem.docketEntry.receivedAt).toBeUndefined();
    expect(outboxItem.docketEntry.documentType).toEqual(
      'Proposed Stipulated Decision',
    );
  });
});