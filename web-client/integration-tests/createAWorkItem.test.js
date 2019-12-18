import { ContactFactory } from '../../shared/src/business/entities/contacts/ContactFactory';
import { fakeFile, setupTest, waitForRouter } from './helpers';

const DOCKET_CLERK_1_ID = '2805d1ab-18d0-43ec-bafb-654e83405416';
const MESSAGE = 'new test message';

/**
 * logs a user in for testing with the given persona
 *
 * @param {string} user username to log in with
 * @returns {void} runs submitLoginSequence
 */
async function loginAs(user) {
  await test.runSequence('updateFormValueSequence', {
    key: 'name',
    value: user,
  });
  await test.runSequence('submitLoginSequence');
}

/**
 * logs a user in for testing with the given persona
 *
 * @param {object} test the current test object
 * @returns {void} creates and persists a new case
 */
async function createCase(test) {
  test.setState('form', {
    caseType: 'CDP (Lien/Levy)',
    contactPrimary: {
      address1: '734 Cowley Parkway',
      address2: 'Cum aut velit volupt',
      address3: 'Et sunt veritatis ei',
      city: 'Et id aut est velit',
      countryType: 'domestic',
      name: 'Mona Schultz',
      phone: '+1 (884) 358-9729',
      postalCode: '77546',
      state: 'CT',
    },
    contactSecondary: {},
    filingType: 'Myself',
    hasIrsNotice: false,
    partyType: ContactFactory.PARTY_TYPES.petitioner,
    preferredTrialCity: 'Lubbock, Texas',
    procedureType: 'Regular',
    signature: true,
  });

  await test.runSequence('updateStartCaseFormValueSequence', {
    key: 'petitionFile',
    value: fakeFile,
  });

  await test.runSequence('updateStartCaseFormValueSequence', {
    key: 'petitionFileSize',
    value: 1,
  });

  await test.runSequence('updateStartCaseFormValueSequence', {
    key: 'stinFile',
    value: fakeFile,
  });

  await test.runSequence('updateStartCaseFormValueSequence', {
    key: 'stinFileSize',
    value: 1,
  });

  await test.runSequence('submitFilePetitionSequence');
  return await waitForRouter();
}

/**
 * returns a document on the test object based on the given documentType
 *
 * @param {object} test the current test object
 * @param {object} documentType the documentType to find in the given set
 * @returns {object} document
 */
function findByDocumentType(test, documentType) {
  return test
    .getState('caseDetail')
    .documents.find(d => d.documentType === documentType);
}

/**
 * returns the docketNumber for a case being generated by tests
 *
 * @param {object} test the current test object
 * @returns {string} docketNumber
 */
function getDocketNumber(test) {
  return test.getState('caseDetail').docketNumber;
}

/**
 * creates a new work item for the given test
 *
 * @param {object} test the current test object
 * @returns {void} runs createWorkItemSequence
 */
function createWorkItem(test) {
  test.setState('form', {
    assigneeId: DOCKET_CLERK_1_ID,
    message: MESSAGE,
    section: 'docket',
  });

  return test.runSequence('createWorkItemSequence');
}

/**
 * finds a workItem in the given queue based on the given getDocketNumber and message
 *
 * @param {object} providers the providers object
 * @param {string} providers.box the work queue box
 * @param {string} providers.docketNumber the docketNumber to search for
 * @param {string} providers.message the message to search for
 * @param {string} providers.queue the work queue name (my || section)
 * @param {object} providers.test the current test object
 * @param {boolean} providers.workQueueIsInternal whether the work queue to be searched is the messages queue
 * @returns {object} workItem
 */
async function findWorkItemInWorkQueue({
  box,
  docketNumber,
  message,
  queue,
  test,
  workQueueIsInternal = true,
}) {
  await test.runSequence('chooseWorkQueueSequence', {
    box,
    queue,
    workQueueIsInternal,
  });

  const workQueue = test.getState('workQueue');

  const workItem = workQueue.find(
    i => i.docketNumber === docketNumber && i.messages[0].message === message,
  );

  return workItem;
}

const test = setupTest();

describe('Create a work item', () => {
  beforeAll(() => {
    jest.setTimeout(30000);
  });

  let docketNumber;
  let petitionDocument;

  it('create the case for this test', async () => {
    await loginAs('petitioner');
    await waitForRouter();
    await createCase(test);
  });

  it('keep track of the docketNumber and petitionDocument', () => {
    docketNumber = getDocketNumber(test);
    petitionDocument = findByDocumentType(test, 'Petition');
  });

  it('login as a petitionsclerk and create a new work item on the petition document', async () => {
    await loginAs('petitionsclerk');
    await waitForRouter();

    await test.runSequence('gotoDocumentDetailSequence', {
      docketNumber: docketNumber,
      documentId: petitionDocument.documentId,
    });

    await createWorkItem(test);
  });

  it('verify the work item exists on the petitions user my outbox', async () => {
    const workItemFromMyOutbox = await findWorkItemInWorkQueue({
      box: 'outbox',
      docketNumber,
      message: MESSAGE,
      queue: 'my',
      test,
    });
    expect(workItemFromMyOutbox).toBeDefined();
  });

  it('verify the work item exists on the petitions section outbox', async () => {
    const workItemFromSectionOutbox = await findWorkItemInWorkQueue({
      box: 'outbox',
      docketNumber,
      message: MESSAGE,
      queue: 'section',
      test,
    });
    expect(workItemFromSectionOutbox).toBeDefined();
  });

  it('login as the docketclerk1 (who we created the new work item for)', async () => {
    await loginAs('docketclerk1');
    await waitForRouter();
  });

  it('verify the work item exists on the docket section inbox', async () => {
    const workItemFromSectionInbox = await findWorkItemInWorkQueue({
      box: 'inbox',
      docketNumber,
      message: MESSAGE,
      queue: 'section',
      test,
    });

    expect(workItemFromSectionInbox).toBeDefined();
  });

  it('verify the work item exists on the docketclerk1 user my inbox', async () => {
    const workItemFromMyInbox = await findWorkItemInWorkQueue({
      box: 'inbox',
      docketNumber,
      message: MESSAGE,
      queue: 'my',
      test,
    });
    expect(workItemFromMyInbox).toBeDefined();
  });
});
