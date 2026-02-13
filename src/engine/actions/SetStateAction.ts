import { z } from 'zod';
import { SetStateActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

export async function handleSetState(
  action: z.infer<typeof SetStateActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    const previousValue = context.getState(action.key);
    context.setState(action.key, action.value, action.merge);

    // Emit state updated event
    await globalEventBus.emit(EVENT_TYPES.STATE_UPDATED, {
      type: EVENT_TYPES.STATE_UPDATED,
      key: action.key,
      value: action.value,
      previousValue,
      source: 'SetStateAction',
    });

    return { success: true };
  } catch (error) {
    // Emit action error event
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType: 'setState',
      error: (error as Error).message,
      component: 'SetStateAction',
    });

    return { success: false, error: error as Error };
  }
}