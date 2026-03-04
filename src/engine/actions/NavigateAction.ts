import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';

type NavigateAction = Extract<Action, { type: 'navigate' }>;

export async function handleNavigate(
  action: NavigateAction,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    const url = action.url;
    if (typeof url !== 'string') {
      return { success: false, error: new Error('Navigate action requires a string URL') };
    }

    // Case 1: Anchor link (scroll to element)
    if (url.startsWith('#')) {
      const fragment = url.slice(1); // Remove '#' prefix
      if (fragment) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            console.warn(`Anchor element with id="${fragment}" not found`);
          }
        }, 0);
      }
      return { success: true };
    }

    // Case 2: External URL (open in new tab)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return { success: true };
    }

    // Case 3: Internal navigation
    // - If starts with /: redirect to that path
    // - Otherwise: treat as step ID and navigate within landing page
    if (url.startsWith('/')) {
      // Path-based redirect (e.g., /checkout, /admin)
      window.location.href = url;
    } else {
      // Step ID navigation (e.g., 'success', 'checkout', 'home')
      context.navigate(url, action.replace);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}