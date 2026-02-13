/**
 * Interpolation utility for template strings like "{{state.cart.items}}"
 */

export function useInterpolation() {
  /**
   * Get value from nested object using dot notation (e.g., "state.cart.items")
   */
  const getNestedValue = (obj: unknown, path: string): unknown => {
    let actualPath = path;
    if (path.startsWith('state.')) {
      actualPath = path.slice(6); // Remove "state." prefix
    }

    const result = actualPath.split('.').reduce((current, key) => {
      if (current === null || current === undefined) return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj);

    return result;
  };

  /**
   * Interpolate template strings like "{{state.cart.items}}" with actual state values
   */
  const interpolateValue = (value: unknown, state: Record<string, unknown>): unknown => {
    if (typeof value !== 'string') {
      return value;
    }

    // Match {{...}} patterns
    const templateRegex = /\{\{(.+?)\}\}/g;
    if (!templateRegex.test(value)) {
      return value;
    }

    // If entire string is a template, return the actual value
    const fullMatch = value.match(/^\{\{(.+?)\}\}$/);
    if (fullMatch) {
      const path = fullMatch[1].trim();
      return getNestedValue(state, path);
    }

    // Otherwise, perform string interpolation
    return value.replace(templateRegex, (_match, path) => {
      const val = getNestedValue(state, path.trim());
      return String(val ?? '');
    });
  };

  /**
   * Recursively interpolate all values in an object
   */
  const interpolateObject = (
    obj: Record<string, unknown>,
    state: Record<string, unknown>
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = interpolateValue(value, state);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item =>
          typeof item === 'object' && item !== null
            ? interpolateObject(item as Record<string, unknown>, state)
            : interpolateValue(item, state)
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = interpolateObject(value as Record<string, unknown>, state);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  return { getNestedValue, interpolateValue, interpolateObject };
}
