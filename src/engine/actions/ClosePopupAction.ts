import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';

type ClosePopupAction = Extract<Action, { type: 'closePopup' }>;

export async function handleClosePopup(
  _action: ClosePopupAction,
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
