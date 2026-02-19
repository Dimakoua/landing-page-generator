import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useActionDispatch } from '@/engine/hooks/useActionDispatch';
import type { ActionDispatcher, Action } from '@/engine/ActionDispatcher';

// Mock ActionDispatcher
const mockDispatch = vi.fn();
const mockDispatcher: ActionDispatcher = {
  dispatch: mockDispatch,
} as any;

describe('useActionDispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty loading state', () => {
    const { result } = renderHook(() => useActionDispatch(mockDispatcher));

    expect(result.current.loading).toEqual({});
  });

  it('should set loading to true when dispatching and false when complete', async () => {
    mockDispatch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)));

    const { result } = renderHook(() => useActionDispatch(mockDispatcher));

    const action: Action = { type: 'log', message: 'test' };

    // Initially not loading
    expect(result.current.loading.testKey).toBeUndefined();

    // Dispatch action
    await act(async () => {
      result.current.dispatchWithLoading('testKey', action);
    });

    // Should be loading immediately
    expect(result.current.loading.testKey).toBe(true);

    // Should not be loading after dispatch completes
    await waitFor(() => {
      expect(result.current.loading.testKey).toBe(false);
    });

    expect(mockDispatch).toHaveBeenCalledWith(action);
  });

  it('should handle dispatch errors and still reset loading', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDispatch.mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(new Error('Test error')), 10)));

    const { result } = renderHook(() => useActionDispatch(mockDispatcher));

    const action: Action = { type: 'log', message: 'test' };

    await act(async () => {
      result.current.dispatchWithLoading('testKey', action);
    });

    // Should be loading
    expect(result.current.loading.testKey).toBe(true);

    // Should reset loading even on error
    await waitFor(() => {
      expect(result.current.loading.testKey).toBe(false);
    });

    expect(mockDispatch).toHaveBeenCalledWith(action);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Action dispatch failed for testKey:'), expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should not dispatch if no action provided', () => {
    const { result } = renderHook(() => useActionDispatch(mockDispatcher));

    result.current.dispatchWithLoading('testKey', undefined);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(result.current.loading.testKey).toBeUndefined();
  });

  it('should not dispatch if no dispatcher provided', () => {
    const { result } = renderHook(() => useActionDispatch(undefined));

    const action: Action = { type: 'log', message: 'test' };
    result.current.dispatchWithLoading('testKey', action);

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(result.current.loading.testKey).toBeUndefined();
  });

  it('should handle multiple concurrent dispatches with different keys', async () => {
    mockDispatch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)));

    const { result } = renderHook(() => useActionDispatch(mockDispatcher));

    const action1: Action = { type: 'log', message: 'test1' };
    const action2: Action = { type: 'log', message: 'test2' };

    // Start both dispatches
    await act(async () => {
      result.current.dispatchWithLoading('key1', action1);
      result.current.dispatchWithLoading('key2', action2);
    });

    // Both should be loading
    expect(result.current.loading.key1).toBe(true);
    expect(result.current.loading.key2).toBe(true);

    // Both should complete
    await waitFor(() => {
      expect(result.current.loading.key1).toBe(false);
      expect(result.current.loading.key2).toBe(false);
    });

    expect(mockDispatch).toHaveBeenCalledWith(action1);
    expect(mockDispatch).toHaveBeenCalledWith(action2);
  });

  it('should maintain loading state for other keys when one completes', async () => {
    // Mock dispatch to resolve at different times
    let resolveFirst: (value?: unknown) => void;
    let resolveSecond: (value?: unknown) => void;

    mockDispatch.mockImplementation(() => {
      if (mockDispatch.mock.calls.length === 1) {
        return new Promise(resolve => { resolveFirst = resolve; });
      } else {
        return new Promise(resolve => { resolveSecond = resolve; });
      }
    });

    const { result } = renderHook(() => useActionDispatch(mockDispatcher));

    const action1: Action = { type: 'navigate', url: '/test1' };
    const action2: Action = { type: 'navigate', url: '/test2' };

    result.current.dispatchWithLoading('key1', action1);
    result.current.dispatchWithLoading('key2', action2);

    // Both loading
    await waitFor(() => {
      expect(result.current.loading.key1).toBe(true);
      expect(result.current.loading.key2).toBe(true);
    });

    // Complete first action
    resolveFirst!();

    // key1 should be false, key2 still true
    await waitFor(() => {
      expect(result.current.loading.key1).toBe(false);
      expect(result.current.loading.key2).toBe(true);
    });

    // Complete second action
    resolveSecond!();

    await waitFor(() => {
      expect(result.current.loading.key1).toBe(false);
      expect(result.current.loading.key2).toBe(false);
    });
  });
});