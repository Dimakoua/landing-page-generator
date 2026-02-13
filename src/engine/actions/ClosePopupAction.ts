import { z } from 'zod';
import { ClosePopupActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

export async function handleClosePopup(
  _action: z.infer<typeof ClosePopupActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    if (context.closePopup) {
      context.closePopup();

      // Emit popup closed event
      await globalEventBus.emit(EVENT_TYPES.POPUP_CLOSED, {
        type: EVENT_TYPES.POPUP_CLOSED,
        source: 'ClosePopupAction',
      });

      return { success: true };
    }

    throw new Error('closePopup not available in context');
  } catch (error) {
    // Emit action error event
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType: 'closePopup',
      error: (error as Error).message,
      component: 'ClosePopupAction',
    });

    return { success: false, error: error as Error };
  }
}
