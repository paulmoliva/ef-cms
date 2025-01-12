import { docketClerkCreatesATrialSession } from './journey/docketClerkCreatesATrialSession';
import { docketClerkSetsCaseReadyForTrial } from './journey/docketClerkSetsCaseReadyForTrial';
import { docketClerkVerifiesPetitionReceiptLength } from './journey/docketClerkVerifiesPetitionReceiptLength';
import { docketClerkViewsTrialSessionList } from './journey/docketClerkViewsTrialSessionList';
import { fakeFile, loginAs, setupTest } from './helpers';
import { markAllCasesAsQCed } from './journey/markAllCasesAsQCed';
import { petitionsClerkCreatesNewCaseFromPaper } from './journey/petitionsClerkCreatesNewCaseFromPaper';
import { petitionsClerkManuallyAddsCaseToTrial } from './journey/petitionsClerkManuallyAddsCaseToTrial';
import { petitionsClerkServesElectronicCaseToIrs } from './journey/petitionsClerkServesElectronicCaseToIrs';
import { petitionsClerkSetsATrialSessionsSchedule } from './journey/petitionsClerkSetsATrialSessionsSchedule';
import { petitionsClerkViewsNewTrialSession } from './journey/petitionsClerkViewsNewTrialSession';
import { practitionerCreatesNewCase } from './journey/practitionerCreatesNewCase';
import { userVerifiesLengthOfDocketEntry } from './journey/userVerifiesLengthOfDocketEntry';

const cerebralTest = setupTest();

describe('Petitions Clerk creates a paper case which should have a clinic letter appended to the receipt', () => {
  const overrides = {
    maxCases: 2,
    preferredTrialCity: 'Los Angeles, California',
    sessionType: 'Regular',
    trialLocation: 'Los Angeles, California',
  };

  beforeAll(() => {
    jest.setTimeout(40000);
  });

  afterAll(() => {
    cerebralTest.closeSocket();
  });

  loginAs(cerebralTest, 'petitionsclerk@example.com');

  petitionsClerkCreatesNewCaseFromPaper(
    cerebralTest,
    fakeFile,
    'Los Angeles, California',
    'Small',
  );
  docketClerkVerifiesPetitionReceiptLength(cerebralTest, 1);

  // creating pro se petition with prefferredTrialCity and procedureType that DOES have a corresponding clinic letter
  petitionsClerkCreatesNewCaseFromPaper(
    cerebralTest,
    fakeFile,
    'Los Angeles, California',
    'Regular',
  );
  docketClerkVerifiesPetitionReceiptLength(cerebralTest, 2);

  describe('Create and sets a trial session with Regular session type for Los Angeles, California', () => {
    loginAs(cerebralTest, 'docketclerk@example.com');
    docketClerkSetsCaseReadyForTrial(cerebralTest);
    docketClerkCreatesATrialSession(cerebralTest, overrides);
    docketClerkViewsTrialSessionList(cerebralTest);

    loginAs(cerebralTest, 'petitionsclerk@example.com');
    cerebralTest.casesReadyForTrial = [];
    petitionsClerkManuallyAddsCaseToTrial(cerebralTest);
    petitionsClerkViewsNewTrialSession(cerebralTest);
    markAllCasesAsQCed(cerebralTest, () => [cerebralTest.docketNumber]);
    petitionsClerkSetsATrialSessionsSchedule(cerebralTest);
  });

  describe('verify the docket record has the NTD with clinic letter appended (2 pages total)', () => {
    userVerifiesLengthOfDocketEntry(cerebralTest, 'NTD', 2);
  });

  loginAs(cerebralTest, 'privatePractitioner@example.com');
  // creating petition with prefferredTrialCity and procedureType that DOES have a corresponding clinic letter
  practitionerCreatesNewCase(
    cerebralTest,
    fakeFile,
    'Los Angeles, California',
    'Regular',
  );
  loginAs(cerebralTest, 'petitionsclerk@example.com');
  petitionsClerkServesElectronicCaseToIrs(cerebralTest);

  describe('Create and sets a second trial session with Regular session type for Los Angeles, California', () => {
    loginAs(cerebralTest, 'docketclerk@example.com');
    docketClerkSetsCaseReadyForTrial(cerebralTest);
    docketClerkCreatesATrialSession(cerebralTest, overrides);
    docketClerkViewsTrialSessionList(cerebralTest);

    loginAs(cerebralTest, 'petitionsclerk@example.com');
    cerebralTest.casesReadyForTrial = [];
    petitionsClerkManuallyAddsCaseToTrial(cerebralTest);
    petitionsClerkViewsNewTrialSession(cerebralTest);
    markAllCasesAsQCed(cerebralTest, () => [cerebralTest.docketNumber]);
    petitionsClerkSetsATrialSessionsSchedule(cerebralTest);
  });

  describe('verify the docket record has the NTD WITHOUT clinic letter appended (1 page total)', () => {
    userVerifiesLengthOfDocketEntry(cerebralTest, 'NTD', 1);
  });
});
