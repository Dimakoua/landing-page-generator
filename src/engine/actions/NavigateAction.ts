import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';

type NavigateAction = Extract<Action, { type: 'navigate' }>;

export async function handleNavigate(
  action: NavigateAction,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    context.navigate(action.url, action.replace);
    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}