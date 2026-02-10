import { z } from 'zod';
import { SetStateActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';

export async function handleSetState(
  action: z.infer<typeof SetStateActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    context.setState(action.key, action.value, action.merge);
    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}