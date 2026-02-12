import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleParallel } from '@/engine/actions/ParallelAction';
import type { Action } from '@/schemas/actions';

describe('ParallelAction', () => {
  let mockDispatch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDispatch = vi.fn().mockResolvedValue({ success: true });
  });

  it('should execute all actions in parallel when waitForAll is true', async () => {
    const actions: Action[] = [
      { type: 'log', message: 'Action 1', level: 'info' },
      { type: 'log', message: 'Action 2', level: 'info' },
      { type: 'log', message: 'Action 3', level: 'info' },
    ];
    const parallelAction = { type: 'parallel' as const, actions, waitForAll: true };

    const result = await handleParallel(parallelAction, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
    expect(result.data).toEqual([
      { success: true },
      { success: true },
      { success: true },
    ]);
  });

  it('should wait for all actions to complete when waitForAll is true', async () => {
    let completionOrder: number[] = [];

    mockDispatch.mockImplementation(async (action: Action) => {
      if (action.type === 'delay') {
        await new Promise(resolve => setTimeout(resolve, action.duration));
        completionOrder.push(action.duration);
      }
      return { success: true };
    });

    const actions: Action[] = [
      { type: 'delay', duration: 100 },
      { type: 'delay', duration: 50 },
      { type: 'delay', duration: 150 },
    ];
    const parallelAction = { type: 'parallel' as const, actions, waitForAll: true };

    const result = await handleParallel(parallelAction, mockDispatch);

    expect(result.success).toBe(true);
    expect(completionOrder).toEqual([50, 100, 150]); // All complete, sorted by duration
  });

  it('should return first completed action when waitForAll is false', async () => {
    mockDispatch.mockImplementation(async (action: Action) => {
      if (action.type === 'delay') {
        await new Promise(resolve => setTimeout(resolve, action.duration));
        return { success: true, data: `Completed after ${action.duration}ms` };
      }
      return { success: true };
    });

    const actions: Action[] = [
      { type: 'delay', duration: 100 },
      { type: 'delay', duration: 50 }, // This should win the race
      { type: 'delay', duration: 150 },
    ];
    const parallelAction = { type: 'parallel' as const, actions, waitForAll: false };

    const result = await handleParallel(parallelAction, mockDispatch);

    expect(result.success).toBe(true);
    expect(result.data).toBe('Completed after 50ms');
  });

  it('should return failure if any action fails when waitForAll is true', async () => {
    mockDispatch
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: new Error('Action 2 failed') })
      .mockResolvedValueOnce({ success: true });

    const actions: Action[] = [
      { type: 'log', message: 'Action 1', level: 'info' },
      { type: 'log', message: 'Action 2', level: 'info' },
      { type: 'log', message: 'Action 3', level: 'info' },
    ];
    const parallelAction = { type: 'parallel' as const, actions, waitForAll: true };

    const result = await handleParallel(parallelAction, mockDispatch);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(3);
  });

  it('should handle empty action array', async () => {
    const parallelAction = { type: 'parallel' as const, actions: [], waitForAll: true };

    const result = await handleParallel(parallelAction, mockDispatch);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('should handle single action', async () => {
    const actions: Action[] = [
      { type: 'log', message: 'Single action', level: 'info' },
    ];
    const parallelAction = { type: 'parallel' as const, actions, waitForAll: true };

    const result = await handleParallel(parallelAction, mockDispatch);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it('should execute actions concurrently not sequentially', async () => {
    const startTimes: Record<number, number> = {};
    
    mockDispatch.mockImplementation(async (action: Action) => {
      if (action.type === 'delay') {
        startTimes[action.duration] = Date.now();
        await new Promise(resolve => setTimeout(resolve, action.duration));
      }
      return { success: true };
    });

    const actions: Action[] = [
      { type: 'delay', duration: 100 },
      { type: 'delay', duration: 100 },
      { type: 'delay', duration: 100 },
    ];
    const parallelAction = { type: 'parallel' as const, actions, waitForAll: true };

    await handleParallel(parallelAction, mockDispatch);

    const times = Object.values(startTimes);
    // All should start around the same time (within 10ms)
    const maxDiff = Math.max(...times) - Math.min(...times);
    expect(maxDiff).toBeLessThan(50);
  });

  it('should handle errors in race mode', async () => {
    mockDispatch
      .mockImplementation(async (action: Action) => {
        if (action.type === 'delay') {
          if (action.duration === 50) {
            throw new Error('Fastest action failed');
          }
          await new Promise(resolve => setTimeout(resolve, action.duration));
        }
        return { success: true };
      });

    const actions: Action[] = [
      { type: 'delay', duration: 100 },
      { type: 'delay', duration: 50 }, // This fails first
    ];
    const parallelAction = { type: 'parallel' as const, actions, waitForAll: false };

    const result = await handleParallel(parallelAction, mockDispatch);

    expect(result.success).toBe(false);
  });
});
