import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSetState } from '@/engine/actions/SetStateAction';
import type { ActionContext } from '@/schemas/actions';

describe('SetStateAction', () => {
  let mockContext: ActionContext;

  beforeEach(() => {
    mockContext = {
      navigate: vi.fn(),
      getState: vi.fn(),
      setState: vi.fn(),
      formData: {},
    } as any;
  });

  it('should call context.setState with key and value', async () => {
    const action = { type: 'setState' as const, key: 'user', value: { name: 'John' }, merge: true };

    const result = await handleSetState(action, mockContext);

    expect(mockContext.setState).toHaveBeenCalledWith('user', { name: 'John' }, true);
    expect(result.success).toBe(true);
  });

  it('should respect merge flag', async () => {
    const action = { type: 'setState' as const, key: 'settings', value: { theme: 'dark' }, merge: false };

    const result = await handleSetState(action, mockContext);

    expect(mockContext.setState).toHaveBeenCalledWith('settings', { theme: 'dark' }, false);
    expect(result.success).toBe(true);
  });

  it('should handle primitive values', async () => {
    const action = { type: 'setState' as const, key: 'count', value: 42, merge: true };

    const result = await handleSetState(action, mockContext);

    expect(mockContext.setState).toHaveBeenCalledWith('count', 42, true);
    expect(result.success).toBe(true);
  });

  it('should handle string values', async () => {
    const action = { type: 'setState' as const, key: 'status', value: 'completed', merge: true };

    const result = await handleSetState(action, mockContext);

    expect(mockContext.setState).toHaveBeenCalledWith('status', 'completed', true);
    expect(result.success).toBe(true);
  });

  it('should handle array values', async () => {
    const action = { type: 'setState' as const, key: 'items', value: ['a', 'b', 'c'], merge: true };

    const result = await handleSetState(action, mockContext);

    expect(mockContext.setState).toHaveBeenCalledWith('items', ['a', 'b', 'c'], true);
    expect(result.success).toBe(true);
  });

  it('should handle setState errors', async () => {
    const error = new Error('setState failed');
    mockContext.setState = vi.fn().mockImplementation(() => {
      throw error;
    });

    const action = { type: 'setState' as const, key: 'test', value: 'value', merge: true };
    const result = await handleSetState(action, mockContext);

    expect(result.success).toBe(false);
    expect(result.error).toEqual(error);
  });
});
