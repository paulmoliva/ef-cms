import { addCourtIssuedDocketEntryHelper as addCourtIssuedDocketEntryHelperComputed } from './addCourtIssuedDocketEntryHelper';
import { applicationContext } from '../../applicationContext';
import { cloneDeep } from 'lodash';
import { runCompute } from 'cerebral/test';
import { withAppContextDecorator } from '../../withAppContext';

const addCourtIssuedDocketEntryHelper = withAppContextDecorator(
  addCourtIssuedDocketEntryHelperComputed,
  {
    ...applicationContext,
    getConstants: () => {
      return {
        COURT_ISSUED_EVENT_CODES: [
          { code: 'Simba', documentType: 'Lion', eventCode: 'ROAR' },
          { code: 'Shenzi', documentType: 'Hyena', eventCode: 'HAHA' },
        ],
      };
    },
  },
);

const state = {
  caseDetail: {
    contactPrimary: { name: 'Banzai' },
    contactSecondary: { name: 'Timon' },
    practitioners: [{ name: 'Scar' }, { name: 'Zazu' }],
    respondents: [{ name: 'Rafiki' }, { name: 'Pumbaa' }],
  },
  form: {
    generatedDocumentTitle: 'Circle of Life',
  },
};

describe('addCourtIssuedDocketEntryHelper', () => {
  it('should calculate document types based on constants in applicationContext', () => {
    const result = runCompute(addCourtIssuedDocketEntryHelper, { state });
    expect(result.documentTypes).toEqual([
      {
        code: 'Simba',
        documentType: 'Lion',
        eventCode: 'ROAR',
        label: 'Lion',
        value: 'ROAR',
      },
      {
        code: 'Shenzi',
        documentType: 'Hyena',
        eventCode: 'HAHA',
        label: 'Hyena',
        value: 'HAHA',
      },
    ]);
  });

  it('should provide a list of service parties based on case detail information', () => {
    const result = runCompute(addCourtIssuedDocketEntryHelper, { state });
    expect(result.serviceParties).toMatchObject([
      { displayName: 'Banzai, Petitioner', name: 'Banzai' },
      { displayName: 'Timon, Petitioner', name: 'Timon' },
      { displayName: 'Scar, Petitioner Counsel', name: 'Scar' },
      { displayName: 'Zazu, Petitioner Counsel', name: 'Zazu' },
      { displayName: 'Rafiki, Respondent Counsel', name: 'Rafiki' },
      { displayName: 'Pumbaa, Respondent Counsel', name: 'Pumbaa' },
    ]);
  });

  it('should provide a list of service parties with a primary contact but no secondary contact', () => {
    const noSecondary = cloneDeep(state);
    delete noSecondary.caseDetail.contactSecondary;
    const result = runCompute(addCourtIssuedDocketEntryHelper, {
      state: noSecondary,
    });
    expect(result.serviceParties).toMatchObject([
      { displayName: 'Banzai, Petitioner', name: 'Banzai' },
      { displayName: 'Scar, Petitioner Counsel', name: 'Scar' },
      { displayName: 'Zazu, Petitioner Counsel', name: 'Zazu' },
      { displayName: 'Rafiki, Respondent Counsel', name: 'Rafiki' },
      { displayName: 'Pumbaa, Respondent Counsel', name: 'Pumbaa' },
    ]);
  });

  it('should return a formatted document title', () => {
    const result = runCompute(addCourtIssuedDocketEntryHelper, { state });

    expect(result.formattedDocumentTitle).toEqual('Circle of Life');
  });

  it('should return a formatted document title with `(Attachment(s))` when present', () => {
    const withAttachments = cloneDeep(state);
    withAttachments.form.attachments = true;
    const result = runCompute(addCourtIssuedDocketEntryHelper, {
      state: withAttachments,
    });

    expect(result.formattedDocumentTitle).toEqual(
      'Circle of Life (Attachment(s))',
    );
  });
});
