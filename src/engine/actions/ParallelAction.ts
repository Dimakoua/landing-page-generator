import { z } from 'zod';
import { ParallelActionSchema } from '../../schemas/actions';
import type { DispatchResult, Action } from '../../schemas/actions';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

export async function handleParallel(
  action: z.infer<typeof ParallelActionSchema>,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  const startTime = Date.now();

  try {
    const promises = action.actions.map(a => dispatch(a));

    if (action.waitForAll) {
      const results = await Promise.all(promises);
      const allSuccess = results.every((r: DispatchResult) => r.success);

      // Emit parallel completed event
      await globalEventBus.emit(EVENT_TYPES.PARALLEL_COMPLETED, {
        type: EVENT_TYPES.PARALLEL_COMPLETED,
        totalActions: action.actions.length,
        success: allSuccess,
        waitForAll: true,
        duration: Date.now() - startTime,
        source: 'ParallelAction',
      });

      return { success: allSuccess, data: results };
    } else {
      const result = await Promise.race(promises);

      // Emit parallel completed event
      await globalEventBus.emit(EVENT_TYPES.PARALLEL_COMPLETED, {
        type: EVENT_TYPES.PARALLEL_COMPLETED,
        totalActions: action.actions.length,
        success: result.success,
        waitForAll: false,
        duration: Date.now() - startTime,
        source: 'ParallelAction',
      });

      return result;
    }
  } catch (error) {
    // Emit action error event
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType: 'parallel',
      error: (error as Error).message,
      component: 'ParallelAction',
    });

    return { success: false, error: error as Error };
  }
}