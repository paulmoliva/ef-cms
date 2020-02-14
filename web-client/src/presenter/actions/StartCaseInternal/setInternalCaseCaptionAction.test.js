import { runAction } from 'cerebral/test';
import { setInternalCaseCaptionAction } from './setInternalCaseCaptionAction';

describe('setInternalCaseCaptionAction', () => {
  it('should set state.form.caseCaption to the passed in props.caseCaption if the tab is caseInfo', async () => {
    const result = await runAction(setInternalCaseCaptionAction, {
      props: {
        caseCaption: 'something something',
        tab: 'caseInfo',
      },
    });

    expect(result.state.form.caseCaption).toEqual('something something');
  });

  it('should not set state.form.caseCaption to the passed in props.caseCaption if the tab is not caseInfo', async () => {
    const result = await runAction(setInternalCaseCaptionAction, {
      props: {
        caseCaption: 'something something',
        tab: 'parties',
      },
    });

    expect(result.state.form).toBeUndefined();
  });
});
