import { z } from 'zod';
import { SetStateActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';
import { EventFactory } from '../events/EventFactory';

export async function handleSetState(
  action: z.infer<typeof SetStateActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    const previousValue = context.getState(action.key);
    context.setState(action.key, action.value, action.merge);

    // Emit state updated event
    await EventFactory.stateUpdated(action.key, action.value, previousValue, 'SetStateAction');

    return { success: true };
  } catch (error) {
    // Emit action error event
    await EventFactory.actionError('setState', (error as Error).message, 'SetStateAction');

    return { success: false, error: error as Error };
  }
}