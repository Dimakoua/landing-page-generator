import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleChain } from '@/engine/actions/ChainAction';
import type { Action } from '@/schemas/actions';

describe('ChainAction', () => {
  let mockDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDispatch = vi.fn().mockResolvedValue({ success: true });
  });

  it('should execute all actions in sequence', async () => {
    const actions: Action[] = [
      { type: 'log', message: 'Step 1', level: 'info' },
      { type: 'log', message: 'Step 2', level: 'info' },
      { type: 'log', message: 'Step 3', level: 'info' },
    ];
    const chainAction = { type: 'chain' as const, actions, stopOnError: true };

    const result = await handleChain(chainAction, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenNthCalledWith(1, actions[0]);
    expect(mockDispatch).toHaveBeenNthCalledWith(2, actions[1]);
    expect(mockDispatch).toHaveBeenNthCalledWith(3, actions[2]);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
  });

  it('should stop on error when stopOnError is true', async () => {
    mockDispatch
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: new Error('Failed at step 2') })
      .mockResolvedValueOnce({ success: true });

    const actions: Action[] = [
      { type: 'log', message: 'Step 1', level: 'info' },
      { type: 'log', message: 'Step 2', level: 'info' },
      { type: 'log', message: 'Step 3', level: 'info' },
    ];
    const chainAction = { type: 'chain' as const, actions, stopOnError: true };

    const result = await handleChain(chainAction, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledTimes(2); // Should stop after failed action
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Chain stopped at action 2');
    expect(result.data).toHaveLength(2);
  });

  it('should continue on error when stopOnError is false', async () => {
    mockDispatch
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: new Error('Failed at step 2') })
      .mockResolvedValueOnce({ success: true });

    const actions: Action[] = [
      { type: 'log', message: 'Step 1', level: 'info' },
      { type: 'log', message: 'Step 2', level: 'info' },
      { type: 'log', message: 'Step 3', level: 'info' },
    ];
    const chainAction = { type: 'chain' as const, actions, stopOnError: false };

    const result = await handleChain(chainAction, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledTimes(3); // Should execute all actions
    expect(result.success).toBe(false); // Overall failure because one failed
    expect(result.data).toHaveLength(3);
  });

  it('should return success when all actions succeed', async () => {
    const actions: Action[] = [
      { type: 'log', message: 'Step 1', level: 'info' },
      { type: 'log', message: 'Step 2', level: 'info' },
    ];
    const chainAction = { type: 'chain' as const, actions, stopOnError: true };

    const result = await handleChain(chainAction, mockDispatch);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      { success: true },
      { success: true },
    ]);
  });

  it('should handle empty action array', async () => {
    const chainAction = { type: 'chain' as const, actions: [], stopOnError: true };

    const result = await handleChain(chainAction, mockDispatch);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('should handle single action', async () => {
    const actions: Action[] = [
      { type: 'log', message: 'Only step', level: 'info' },
    ];
    const chainAction = { type: 'chain' as const, actions, stopOnError: true };

    const result = await handleChain(chainAction, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it('should execute actions sequentially not in parallel', async () => {
    const executionOrder: number[] = [];
    
    mockDispatch.mockImplementation(async (action: Action) => {
      if (action.type === 'log') {
        const match = action.message!.match(/Step (\d+)/);
        if (match) {
          await new Promise(resolve => setTimeout(resolve, 10));
          executionOrder.push(parseInt(match[1]));
        }
      }
      return { success: true };
    });

    const actions: Action[] = [
      { type: 'log', message: 'Step 1', level: 'info' },
      { type: 'log', message: 'Step 2', level: 'info' },
      { type: 'log', message: 'Step 3', level: 'info' },
    ];
    const chainAction = { type: 'chain' as const, actions, stopOnError: true };

    await handleChain(chainAction, mockDispatch);

    expect(executionOrder).toEqual([1, 2, 3]); // Should be in order
  });
});
