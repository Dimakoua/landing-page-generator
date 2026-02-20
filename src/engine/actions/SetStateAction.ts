import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';

type SetStateAction = Extract<Action, { type: 'setState' }>;

const isObjectLike = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

const areValuesEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) {
    return true;
  }

  if (!isObjectLike(a) || !isObjectLike(b)) {
    return false;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i += 1) {
      if (!areValuesEqual(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!areValuesEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
};

export async function handleSetState(
  action: SetStateAction,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    const mergeFlag = action.merge ?? true;
    const previousValue = context.getState(action.key);
    const nextValue = mergeFlag && isObjectLike(previousValue) && isObjectLike(action.value)
      ? {
        ...(previousValue as Record<string, unknown>),
        ...(action.value as Record<string, unknown>),
      }
      : action.value;

    if (areValuesEqual(previousValue, nextValue)) {
      return { success: true };
    }

    context.setState(action.key, action.value, action.merge);
    return { success: true };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}