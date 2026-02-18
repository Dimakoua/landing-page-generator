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