import { clearFormAction } from '../actions/clearFormAction';
import { getCaseAction } from '../actions/getCaseAction';
import { getUsersInSectionAction } from '../actions/getUsersInSectionAction';
import { isLoggedInAction } from '../actions/isLoggedInAction';
import { redirectToCognitoAction } from '../actions/redirectToCognitoAction';
import { set } from 'cerebral/factories';
import { setBaseUrlAction } from '../actions/setBaseUrlAction';
import { setCaseAction } from '../actions/setCaseAction';
import { setCourtIssuedDocumentInitialTypeAction } from '../actions/CourtIssuedDocketEntry/setCourtIssuedDocumentInitialTypeAction';
import { setCurrentPageAction } from '../actions/setCurrentPageAction';
import { setDocumentIdAction } from '../actions/setDocumentIdAction';
import { setUsersByKeyAction } from '../actions/setUsersByKeyAction';
import { state } from 'cerebral';
import { stopShowValidationAction } from '../actions/stopShowValidationAction';

export const gotoAddCourtIssuedDocketEntrySequence = [
  isLoggedInAction,
  {
    isLoggedIn: [
      setCurrentPageAction('Interstitial'),
      stopShowValidationAction,
      setBaseUrlAction,
      clearFormAction,
      getUsersInSectionAction({ section: 'judge' }),
      setUsersByKeyAction('judgeUsers'),
      getCaseAction,
      setCaseAction,
      setDocumentIdAction,
      setCourtIssuedDocumentInitialTypeAction,
      set(state.isEditingDocketEntry, false),
      setCurrentPageAction('CourtIssuedDocketEntry'),
    ],
    unauthorized: [redirectToCognitoAction],
  },
];
