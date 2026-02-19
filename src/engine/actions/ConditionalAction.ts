import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';

type ConditionalAction = Extract<Action, { type: 'conditional' }>;

/**
 * Evaluate a condition spec against a minimal context (only needs getState).
 * Exported so other parts of the engine (rendering) can reuse identical logic.
 */
export function evaluateCondition(
  spec: Partial<ConditionalAction>,
  context: { getState: (path?: string) => unknown }
): boolean {
  let conditionMet = false;
  switch (spec.condition) {
    case 'stateEquals':
      if (!spec.key) throw new Error('key required for stateEquals condition');
      conditionMet = context.getState(spec.key) === spec.value;
      break;
    case 'stateExists':
      if (!spec.key) throw new Error('key required for stateExists condition');
      conditionMet = context.getState(spec.key) !== undefined;
      break;
    case 'stateMatches':
      if (!spec.key) throw new Error('key required for stateMatches condition');
      if (!spec.pattern) throw new Error('pattern required for stateMatches condition');
      {
        const stateVal = context.getState(spec.key);
        const str = typeof stateVal === 'string' ? stateVal : JSON.stringify(stateVal);
        const re = new RegExp(spec.pattern, spec.flags as string | undefined);
        conditionMet = re.test(str);
      }
      break;
    case 'userAgentMatches':
      if (!spec.pattern) throw new Error('pattern required for userAgentMatches condition');
      {
        const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || String(context.getState('client.userAgent') || '');
        const re = new RegExp(spec.pattern, spec.flags as string | undefined);
        conditionMet = re.test(ua);
      }
      break;
    case 'userAgentIncludes':
      if (spec.value === undefined) throw new Error('value required for userAgentIncludes condition');
      {
        const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || String(context.getState('client.userAgent') || '');
        const needle = String(spec.value).toLowerCase();
        conditionMet = ua.toLowerCase().includes(needle);
      }
      break;
    case 'custom':
      // reserved for future extension
      conditionMet = false;
      break;
    default:
      conditionMet = false;
  }
  return conditionMet;
}

export async function handleConditional(
  action: ConditionalAction,
  context: ActionContext,
  dispatch: (action: Action) => Promise<DispatchResult>
): Promise<DispatchResult> {
  try {
    const conditionMet = evaluateCondition(action, { getState: context.getState });

    const targetAction = conditionMet ? action.ifTrue : action.ifFalse;
    if (!targetAction) {
      return { success: true, data: { conditionMet, executed: false } };
    }

    return await dispatch(targetAction);
  } catch (error) {
    return { success: false, error: error as Error };
  }
}