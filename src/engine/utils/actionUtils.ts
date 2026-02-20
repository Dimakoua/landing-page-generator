import type { Action } from '../../schemas/actions';

/**
 * Normalizes an action or an array of actions into a single Action.
 * If an array is provided, it is wrapped in a 'chain' action.
 */
export function normalizeActionOrArray(input: Action | Action[]): Action {
  if (Array.isArray(input)) {
    return {
      type: 'chain',
      actions: input,
    };
  }
  return input;
}
