import { z } from 'zod';
import { ConditionalActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';

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

    // Emit condition evaluated event
    await globalEventBus.emit(EVENT_TYPES.CONDITION_EVALUATED, {
      type: EVENT_TYPES.CONDITION_EVALUATED,
      condition: action.condition,
      key: action.key,
      value: action.value,
      conditionMet,
      source: 'ConditionalAction',
    });

    const targetAction = conditionMet ? action.ifTrue : action.ifFalse;
    if (!targetAction) {
      return { success: true, data: { conditionMet, executed: false } };
    }

    const result = await dispatch(targetAction);

    // Emit conditional executed event
    await globalEventBus.emit(EVENT_TYPES.CONDITIONAL_EXECUTED, {
      type: EVENT_TYPES.CONDITIONAL_EXECUTED,
      condition: action.condition,
      conditionMet,
      executed: true,
      success: result.success,
      source: 'ConditionalAction',
    });

    return result;
  } catch (error) {
    // Emit action error event
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType: 'conditional',
      error: (error as Error).message,
      component: 'ConditionalAction',
    });

    return { success: false, error: error as Error };
  }
}