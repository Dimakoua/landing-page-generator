import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleDelay } from '@/engine/actions/DelayAction';
import type { Action } from '@/schemas/actions';

describe('DelayAction', () => {
  let mockDispatch: any;

  beforeEach(() => {
    mockDispatch = vi.fn().mockResolvedValue({ success: true });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay for specified duration', async () => {
    const action = { type: 'delay' as const, duration: 1000 };

    const resultPromise = handleDelay(action, mockDispatch as any);
    
    // Fast-forward time
    await vi.advanceTimersByTimeAsync(1000);
    
    const result = await resultPromise;

    expect(result.success).toBe(true);
  });

  it('should execute "then" action after delay', async () => {
    const thenAction: Action = { type: 'log', message: 'Delayed log', level: 'info' };
    const action = { type: 'delay' as const, duration: 500, then: thenAction };

    const resultPromise = handleDelay(action, mockDispatch as any);
    
    await vi.advanceTimersByTimeAsync(500);
    
    const result = await resultPromise;

    expect(mockDispatch).toHaveBeenCalledWith(thenAction);
    expect(result.success).toBe(true);
  });

  it('should return error if "then" action fails', async () => {
    const thenAction: Action = { type: 'log', message: 'Test', level: 'info' };
    const action = { type: 'delay' as const, duration: 500, then: thenAction };
    
    mockDispatch.mockResolvedValue({ success: false, error: new Error('Dispatch failed') });

    const resultPromise = handleDelay(action, mockDispatch as any);
    
    await vi.advanceTimersByTimeAsync(500);
    
    const result = await resultPromise;

    expect(result.success).toBe(false);
  });

  it('should handle zero duration delay', async () => {
    const action = { type: 'delay' as const, duration: 0 };

    const resultPromise = handleDelay(action, mockDispatch as any);
    
    await vi.advanceTimersByTimeAsync(0);
    
    const result = await resultPromise;

    expect(result.success).toBe(true);
  });

  it('should handle errors during delay execution', async () => {
    const action = { type: 'delay' as const, duration: 1000 };
    
    // Simulate error by throwing in dispatch
    const thenAction: Action = { type: 'log', message: 'Test', level: 'info' };
    mockDispatch.mockRejectedValue(new Error('Timer error'));
    
    const actionWithThen = { ...action, then: thenAction };
    const resultPromise = handleDelay(actionWithThen, mockDispatch as any);
    
    await vi.advanceTimersByTimeAsync(1000);
    
    const result = await resultPromise;

    expect(result.success).toBe(false);
  });
});
