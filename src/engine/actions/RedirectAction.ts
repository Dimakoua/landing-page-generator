import type { DispatchResult, Action } from '../../schemas/actions';

type RedirectAction = Extract<Action, { type: 'redirect' }>;

export async function handleRedirect(
  action: RedirectAction
): Promise<DispatchResult> {
  try {
    if (action.target === '_blank') {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = action.url;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}