import { z } from 'zod';
import { NavigateActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

export async function handleNavigate(
  action: z.infer<typeof NavigateActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    // Emit navigation event
    await globalEventBus.emit(EVENT_TYPES.NAVIGATE, {
      type: EVENT_TYPES.NAVIGATE,
      url: action.url,
      replace: action.replace,
      source: 'NavigateAction',
    });

    context.navigate(action.url, action.replace);
    return { success: true };
  } catch (error) {
    // Emit action error event
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType: 'navigate',
      error: (error as Error).message,
      component: 'NavigateAction',
    });

    return { success: false, error: error as Error };
  }
}