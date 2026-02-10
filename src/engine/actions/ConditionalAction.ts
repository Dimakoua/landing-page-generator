import { z } from 'zod';
import { ConditionalActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';

export async function handleConditional(
  action: z.infer<typeof ConditionalActionSchema>,
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