import { z } from 'zod';
import { ParallelActionSchema } from '../../schemas/actions';
import type { DispatchResult, Action } from '../../schemas/actions';

export async function handleParallel(
  action: z.infer<typeof ParallelActionSchema>,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  try {
    const promises = action.actions.map(a => dispatch(a));

    if (action.waitForAll) {
      const results = await Promise.all(promises);
      const allSuccess = results.every(r => r.success);
      return { success: allSuccess, data: results };
    } else {
      const result = await Promise.race(promises);
      return result;
    }
  } catch (error) {
    return { success: false, error: error as Error };
  }
}