import { z } from 'zod';
import { DelayActionSchema } from '../../schemas/actions';
import type { DispatchResult, Action } from '../../schemas/actions';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

export async function handleDelay(
  action: z.infer<typeof DelayActionSchema>,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  try {
    const startTime = Date.now();

    await new Promise(resolve => setTimeout(resolve, action.duration));

    // Emit delay completed event
    await globalEventBus.emit(EVENT_TYPES.DELAY_COMPLETED, {
      type: EVENT_TYPES.DELAY_COMPLETED,
      duration: action.duration,
      actualDuration: Date.now() - startTime,
      source: 'DelayAction',
    });

    if (action.then) {
      return await dispatch(action.then);
    }

    return { success: true };
  } catch (error) {
    // Emit action error event
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType: 'delay',
      error: (error as Error).message,
      component: 'DelayAction',
    });

    return { success: false, error: error as Error };
  }
}