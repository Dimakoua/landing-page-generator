import { z } from 'zod';
import { ChainActionSchema } from '../../schemas/actions';
import type { DispatchResult, Action } from '../../schemas/actions';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

export async function handleChain(
  action: z.infer<typeof ChainActionSchema>,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  const results: DispatchResult[] = [];
  const startTime = Date.now();

  try {
    for (let i = 0; i < action.actions.length; i++) {
      const childAction = action.actions[i];
      const result = await dispatch(childAction);
      results.push(result);

      // Emit chain step completed event
      await globalEventBus.emit(EVENT_TYPES.CHAIN_STEP_COMPLETED, {
        type: EVENT_TYPES.CHAIN_STEP_COMPLETED,
        stepIndex: i,
        totalSteps: action.actions.length,
        success: result.success,
        error: result.error?.message,
        source: 'ChainAction',
      });

      if (!result.success && action.stopOnError) {
        // Emit chain stopped event
        await globalEventBus.emit(EVENT_TYPES.CHAIN_STOPPED, {
          type: EVENT_TYPES.CHAIN_STOPPED,
          stepIndex: i,
          totalSteps: action.actions.length,
          error: result.error?.message,
          source: 'ChainAction',
        });

        return {
          success: false,
          error: new Error(`Chain stopped at action ${results.length}: ${result.error?.message}`),
          data: results,
        };
      }
    }

    const allSuccess = results.every(r => r.success);

    // Emit chain completed event
    await globalEventBus.emit(EVENT_TYPES.CHAIN_COMPLETED, {
      type: EVENT_TYPES.CHAIN_COMPLETED,
      totalSteps: action.actions.length,
      success: allSuccess,
      duration: Date.now() - startTime,
      source: 'ChainAction',
    });

    return {
      success: allSuccess,
      data: results,
    };
  } catch (error) {
    // Emit action error event
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType: 'chain',
      error: (error as Error).message,
      component: 'ChainAction',
    });

    return { success: false, error: error as Error };
  }
}