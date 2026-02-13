import { z } from 'zod';
import { RedirectActionSchema } from '../../schemas/actions';
import type { DispatchResult } from '../../schemas/actions';
import { EventFactory } from '../events/EventFactory';

export async function handleRedirect(
  action: z.infer<typeof RedirectActionSchema>
): Promise<DispatchResult> {
  try {
    // Emit redirect event
    await EventFactory.redirect(action.url, action.target, 'RedirectAction');

    if (action.target === '_blank') {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = action.url;
    }
    return { success: true };
  } catch (error) {
    // Emit action error event
    await EventFactory.actionError('redirect', (error as Error).message, 'RedirectAction');

    return { success: false, error: error as Error };
  }
}