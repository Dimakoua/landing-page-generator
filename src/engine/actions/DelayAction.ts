import { z } from 'zod';
import { DelayActionSchema } from '../../schemas/actions';
import type { DispatchResult, Action } from '../../schemas/actions';

export async function handleDelay(
  action: z.infer<typeof DelayActionSchema>,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  try {
    await new Promise(resolve => setTimeout(resolve, action.duration));

    if (action.then) {
      return await dispatch(action.then);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}