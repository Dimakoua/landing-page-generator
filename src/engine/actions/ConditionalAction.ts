import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';

type ConditionalAction = Extract<Action, { type: 'conditional' }>;

export async function handleConditional(
  action: ConditionalAction,
  context: ActionContext,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  try {
    let conditionMet = false;

    switch (action.condition) {
      case 'stateEquals':
        if (!action.key) throw new Error('key required for stateEquals condition');
        conditionMet = context.getState(action.key) === action.value;
        break;
      case 'stateExists':
        if (!action.key) throw new Error('key required for stateExists condition');
        conditionMet = context.getState(action.key) !== undefined;
        break;
      case 'stateMatches':
        if (!action.key) throw new Error('key required for stateMatches condition');
        if (!(action as any).pattern) throw new Error('pattern required for stateMatches condition');
        {
          const stateVal = context.getState(action.key);
          const str = typeof stateVal === 'string' ? stateVal : JSON.stringify(stateVal);
          const pattern = (action as any).pattern as string;
          const flags = (action as any).flags as string | undefined;
          const re = new RegExp(pattern, flags);
          conditionMet = re.test(str);
        }
        break;
      case 'userAgentMatches':
        // Tests navigator.userAgent first, falls back to state at `client.userAgent`.
        if (!(action as any).pattern) throw new Error('pattern required for userAgentMatches condition');
        {
          const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || String(context.getState?.('client.userAgent') || '');
          const pattern = (action as any).pattern as string;
          const flags = (action as any).flags as string | undefined;
          const re = new RegExp(pattern, flags);
          conditionMet = re.test(ua);
        }
        break;
      case 'userAgentIncludes':
        // Simple substring match (case-insensitive). Accepts `value`.
        if ((action as any).value === undefined) throw new Error('value required for userAgentIncludes condition');
        {
          const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || String(context.getState?.('client.userAgent') || '');
          const needle = String((action as any).value).toLowerCase();
          conditionMet = ua.toLowerCase().includes(needle);
        }
        break;
      case 'custom':
        // Could be extended to support custom condition functions
        conditionMet = false;
        break;
    }

    const targetAction = conditionMet ? action.ifTrue : action.ifFalse;
    if (!targetAction) {
      return { success: true, data: { conditionMet, executed: false } };
    }

    return await dispatch(targetAction);
  } catch (error) {
    return { success: false, error: error as Error };
  }
}