import { applicationContextForClient as applicationContext } from '../../../../../shared/src/business/test/createTestApplicationContext';
import { getTrialSessionsAction } from './getTrialSessionsAction';
import { presenter } from '../../presenter';
import { runAction } from 'cerebral/test';

describe('getTrialSessionsAction', () => {
  beforeEach(() => {
    presenter.providers.applicationContext = applicationContext;
    applicationContext
      .getUseCases()
      .getTrialSessionsInteractor.mockReturnValue([]);
  });

  it('should retrieve trial sessions', async () => {
    const result = await runAction(getTrialSessionsAction, {
      modules: {
        presenter,
      },
    });

    expect(result.output).toMatchObject({
      trialSessions: [],
    });
  });
});
