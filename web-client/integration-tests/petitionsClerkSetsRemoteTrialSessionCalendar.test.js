import { applicationContextForClient as applicationContext } from '../../shared/src/business/test/createTestApplicationContext';
import { docketClerkCreatesARemoteTrialSession } from './journey/docketClerkCreatesARemoteTrialSession';
import { docketClerkSetsCaseReadyForTrial } from './journey/docketClerkSetsCaseReadyForTrial';
import { docketClerkViewsTrialSessionList } from './journey/docketClerkViewsTrialSessionList';
import { fakeFile, loginAs, setupTest, uploadPetition } from './helpers';
import { formattedTrialSessionDetails } from '../src/presenter/computeds/formattedTrialSessionDetails';
import { manuallyAddCaseToTrial } from './utils/manuallyAddCaseToTrial';
import { petitionsClerkCreatesNewCase } from './journey/petitionsClerkCreatesNewCase';
import { petitionsClerkSubmitsCaseToIrs } from './journey/petitionsClerkSubmitsCaseToIrs.js';
import { petitionsClerkViewsOpenTrialSession } from './journey/petitionsClerkViewsOpenTrialSession';
import { runCompute } from 'cerebral/test';
import { withAppContextDecorator } from '../src/withAppContext';

const cerebralTest = setupTest();

describe('petitions clerk sets a remote trial session calendar', () => {
  const { CASE_TYPES_MAP } = applicationContext.getConstants();
  const trialLocation = `Denver, Colorado, ${Date.now()}`;
  const overrides = {
    maxCases: 2,
    preferredTrialCity: trialLocation,
    sessionType: 'Small',
    trialLocation,
  };

  beforeAll(() => {
    jest.setTimeout(30000);
  });

  afterAll(() => {
    cerebralTest.closeSocket();
  });

  describe(`Create a remote trial session with Small session type for '${trialLocation}'`, () => {
    loginAs(cerebralTest, 'docketclerk@example.com');
    docketClerkCreatesARemoteTrialSession(cerebralTest, overrides);
    docketClerkViewsTrialSessionList(cerebralTest);
  });

  it('status of remote trial sessions should be open', async () => {
    await cerebralTest.runSequence('gotoTrialSessionDetailSequence', {
      trialSessionId: cerebralTest.trialSessionId,
    });

    const trialSessionFormatted = runCompute(
      withAppContextDecorator(formattedTrialSessionDetails),
      {
        state: cerebralTest.getState(),
      },
    );

    expect(trialSessionFormatted.computedStatus).toEqual('Open');
  });

  describe('Create cases', () => {
    describe('cases #1-3 - eligible for trial', () => {
      const caseOverrides = {
        ...overrides,
        caseType: CASE_TYPES_MAP.cdp,
        procedureType: 'Small',
      };

      for (let i = 0; i < 3; i++) {
        loginAs(cerebralTest, 'petitioner@example.com');
        it(`create case ${i} and set ready for trial`, async () => {
          const caseDetail = await uploadPetition(cerebralTest, caseOverrides);
          expect(caseDetail.docketNumber).toBeDefined();
          cerebralTest.docketNumber = caseDetail.docketNumber;
        });

        loginAs(cerebralTest, 'petitionsclerk@example.com');
        petitionsClerkSubmitsCaseToIrs(cerebralTest);

        loginAs(cerebralTest, 'docketclerk@example.com');
        docketClerkSetsCaseReadyForTrial(cerebralTest);
      }
    });

    describe('case #5 - manually added to session', () => {
      loginAs(cerebralTest, 'petitionsclerk@example.com');
      cerebralTest.casesReadyForTrial = [];
      petitionsClerkCreatesNewCase(cerebralTest, fakeFile, trialLocation);
      manuallyAddCaseToTrial(cerebralTest);
    });
  });

  describe('petitions clerk views the trial session', () => {
    petitionsClerkViewsOpenTrialSession(cerebralTest);

    it('the trial session should be open and have 1 manually added cases on it', () => {
      const trialSessionFormatted = runCompute(
        withAppContextDecorator(formattedTrialSessionDetails),
        {
          state: cerebralTest.getState(),
        },
      );

      expect(trialSessionFormatted.openCases.length).toEqual(1);
    });
  });
});
