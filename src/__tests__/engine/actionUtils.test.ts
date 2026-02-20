import { describe, it, expect } from 'vitest';
import { normalizeActionOrArray } from '@/engine/utils/actionUtils';

describe('actionUtils', () => {
  describe('normalizeActionOrArray', () => {
    it('should return the action if it is not an array', () => {
      const action = { type: 'log', message: 'test' } as any;
      const result = normalizeActionOrArray(action);
      expect(result).toBe(action);
    });

    it('should wrap an array of actions in a chain action', () => {
      const actions = [
        { type: 'log', message: '1' } as any,
        { type: 'log', message: '2' } as any,
      ];
      const result = normalizeActionOrArray(actions);
      expect(result).toEqual({
        type: 'chain',
        actions: actions,
      });
    });
  });
});
