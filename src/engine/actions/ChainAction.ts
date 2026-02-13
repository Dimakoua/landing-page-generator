import type { DispatchResult, Action } from '../../schemas/actions';

type ChainAction = Extract<Action, { type: 'chain' }>;

export async function handleChain(
  action: ChainAction,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  const results: DispatchResult[] = [];

  for (const childAction of action.actions) {
    const result = await dispatch(childAction);
    results.push(result);

    if (!result.success && action.stopOnError) {
      return {
        success: false,
        error: new Error(`Chain stopped at action ${results.length}: ${result.error?.message}`),
        data: results,
      };
    }
  }

  const allSuccess = results.every(r => r.success);
  return {
    success: allSuccess,
    data: results,
  };
}