import { applicationContext } from '../../applicationContext';
import { reviewSavedPetitionHelper as reviewSavedPetitionHelperComputed } from './reviewSavedPetitionHelper';
import { runCompute } from 'cerebral/test';
import { withAppContextDecorator } from '../../withAppContext';

const { PAYMENT_STATUS } = applicationContext.getConstants();

const reviewSavedPetitionHelper = withAppContextDecorator(
  reviewSavedPetitionHelperComputed,
  {
    ...applicationContext,
    getConstants: () => {
      return {
        ...applicationContext.getConstants(),
      };
    },
  },
);

describe('reviewSavedPetitionHelper', () => {
  it('returns defaults when there is no form', () => {
    const result = runCompute(reviewSavedPetitionHelper, {
      state: {
        form: {},
      },
    });
    expect(result).toEqual({
      hasIrsNoticeFormatted: 'No',
      irsNoticeDateFormatted: undefined,
      mailingDateFormatted: undefined,
      petitionPaymentStatusFormatted: 'Not paid',
      receivedAtFormatted: undefined,
      shouldShowIrsNoticeDate: false,
    });
  });

  it('returns defaults when there is no form', () => {
    const result = runCompute(reviewSavedPetitionHelper, {
      state: {
        form: {
          dateReceived: '2020-01-05T03:30:45.007Z',
          hasVerifiedIrsNotice: true,
          irsNoticeDate: '2020-01-05T03:30:45.007Z',
          mailingDate: '2020-01-05T03:30:45.007Z',
          petitionPaymentStatus: PAYMENT_STATUS.PAID,
        },
      },
    });

    expect(result).toEqual({
      hasIrsNoticeFormatted: 'Yes',
      irsNoticeDateFormatted: '01/04/2020',
      mailingDateFormatted: '01/04/2020',
      petitionPaymentStatusFormatted: 'Paid',
      receivedAtFormatted: '01/04/2020',
      shouldShowIrsNoticeDate: true,
    });
  });
});
