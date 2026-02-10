import { z } from 'zod';
import { ClosePopupActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';

export async function handleClosePopup(
  _action: z.infer<typeof ClosePopupActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    if (context.closePopup) {
      context.closePopup();
      return { success: true };
    }
    return { success: false, error: new Error('closePopup not available in context') };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
