import { applicationContextForClient } from '../../../../../shared/src/business/test/createTestApplicationContext';
import { getAllCaseDeadlinesAction } from './getAllCaseDeadlinesAction';
import { presenter } from '../../presenter';
import { runAction } from 'cerebral/test';

presenter.providers.applicationContext = applicationContextForClient;

describe('getAllCaseDeadlinesAction', () => {
  it('gets all case deadlines', async () => {
    presenter.providers.applicationContext.getUseCases().getAllCaseDeadlinesInteractor = jest
      .fn()
      .mockReturnValue('hello world');

    const result = await runAction(getAllCaseDeadlinesAction, {
      modules: {
        presenter,
      },
    });
    expect(result.output.caseDeadlines).toEqual('hello world');
  });
});
