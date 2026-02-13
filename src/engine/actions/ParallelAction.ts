import type { DispatchResult, Action } from '../../schemas/actions';

type ParallelAction = Extract<Action, { type: 'parallel' }>;

export async function handleParallel(
  action: ParallelAction,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  try {
    const promises = action.actions.map(a => dispatch(a));

    if (action.waitForAll) {
      const results = await Promise.all(promises);
      const allSuccess = results.every((r: DispatchResult) => r.success);
      return { success: allSuccess, data: results };
    } else {
      const result = await Promise.race(promises);
      return result;
    }
  } catch (error) {
    return { success: false, error: error as Error };
  }
}