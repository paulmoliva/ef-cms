const createApplicationContext = require('../../../web-api/src/applicationContext');
const {
  getEligibleCasesForTrialSession,
} = require('../../src/persistence/dynamo/trialSessions/getEligibleCasesForTrialSession');
const {
  TrialSession,
} = require('../../src/business/entities/trialSessions/TrialSession');

const {
  TRIAL_SESSION_ELIGIBLE_CASES_BUFFER,
} = require('../../src/business/entities/EntityConstants');

const applicationContext = createApplicationContext({});

const trialSessionId = process.argv[2];
const skPrefix = process.argv[3];

if (!trialSessionId || !skPrefix) {
  console.log(`
  Usage: 

  $ node diagnoseTrialSessionBug.js <trialSessionId> <skPrefix>

  Example: 

  $ node diagnoseTrialSessionBug.js 8ab4e703-7c28-415a-94e4-ef8b97ba7c4c AtlantaGeorgia-
  `);
}

(async () => {
  const trialSession = await applicationContext
    .getPersistenceGateway()
    .getTrialSessionById({
      applicationContext,
      trialSessionId,
    });

  const trialSessionEntity = new TrialSession(trialSession, {
    applicationContext,
  });

  trialSessionEntity.validate();
  let calendaredCases = [];
  console.log(trialSessionEntity.generateSortKeyPrefix());

  await applicationContext
    .getPersistenceGateway()
    .getEligibleCasesForTrialSession({
      applicationContext,
      limit:
        trialSessionEntity.maxCases +
        TRIAL_SESSION_ELIGIBLE_CASES_BUFFER -
        calendaredCases.length,
      skPrefix: trialSessionEntity.generateSortKeyPrefix(),
    });

  const res = await getEligibleCasesForTrialSession({
    applicationContext,
    limit: 1000,
    skPrefix,
  });
  console.log(res);
})();
