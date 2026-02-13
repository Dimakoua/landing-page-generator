import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';

type SetStateAction = Extract<Action, { type: 'setState' }>;

export async function handleSetState(
  action: SetStateAction,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    context.setState(action.key, action.value, action.merge);
    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}