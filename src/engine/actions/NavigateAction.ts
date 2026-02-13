import { z } from 'zod';
import { NavigateActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';
import { EventFactory } from '../events/EventFactory';

export async function handleNavigate(
  action: z.infer<typeof NavigateActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    // Emit navigation event
    await EventFactory.navigate(action.url, action.replace, 'NavigateAction');

    context.navigate(action.url, action.replace);
    return { success: true };
  } catch (error) {
    // Emit action error event
    await EventFactory.actionError('navigate', (error as Error).message, 'NavigateAction');

    return { success: false, error: error as Error };
  }
}