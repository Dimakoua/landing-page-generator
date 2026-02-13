import type { DispatchResult, Action } from '../../schemas/actions';

type DelayAction = Extract<Action, { type: 'delay' }>;

export async function handleDelay(
  action: DelayAction,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  try {
    await new Promise(resolve => setTimeout(resolve, action.duration));

    if (action.then) {
      return await dispatch(action.then);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}