import { z } from 'zod';
import { RedirectActionSchema } from '../../schemas/actions';
import type { DispatchResult } from '../../schemas/actions';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

export async function handleRedirect(
  action: z.infer<typeof RedirectActionSchema>
): Promise<DispatchResult> {
  try {
    // Emit redirect event
    await globalEventBus.emit(EVENT_TYPES.REDIRECT, {
      type: EVENT_TYPES.REDIRECT,
      url: action.url,
      target: action.target,
      source: 'RedirectAction',
    });

    if (action.target === '_blank') {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = action.url;
    }
    return { success: true };
  } catch (error) {
    // Emit action error event
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType: 'redirect',
      error: (error as Error).message,
      component: 'RedirectAction',
    });

    return { success: false, error: error as Error };
  }
}