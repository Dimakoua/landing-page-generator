import { z } from 'zod';
import { NavigateActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';

export async function handleNavigate(
  action: z.infer<typeof NavigateActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    context.navigate(action.url, action.replace);
    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}