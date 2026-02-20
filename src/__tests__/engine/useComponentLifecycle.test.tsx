import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useComponentLifecycle } from '@/engine/hooks/useComponentLifecycle';
import { ActionDispatcher } from '@/engine/ActionDispatcher';

describe('useComponentLifecycle', () => {
  let mockDispatcher: ActionDispatcher;

  beforeEach(() => {
    mockDispatcher = {
      dispatch: vi.fn(),
      registerController: vi.fn(),
      abortComponent: vi.fn(),
    } as unknown as ActionDispatcher;
    vi.clearAllMocks();
  });

  it('should execute beforeMount action exactly once', () => {
    const lifetime = {
      beforeMount: { type: 'log', message: 'before' } as any,
    };

    const { rerender } = renderHook(() => 
      useComponentLifecycle(mockDispatcher, lifetime)
    );

    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(lifetime.beforeMount);
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);

    rerender();
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
  });

  it('should execute onMount and onUnmount actions', () => {
    const lifetime = {
      onMount: { type: 'log', message: 'mount' } as any,
      onUnmount: { type: 'log', message: 'unmount' } as any,
    };

    const { unmount } = renderHook(() => 
      useComponentLifecycle(mockDispatcher, lifetime)
    );

    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(lifetime.onMount);
    
    unmount();
    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(lifetime.onUnmount);
  });

  it('should execute beforeUnmount before onUnmount', () => {
    const calls: string[] = [];
    vi.mocked(mockDispatcher.dispatch).mockImplementation((action: any) => {
      calls.push(action.message);
      return Promise.resolve({ success: true });
    });

    const lifetime = {
      beforeUnmount: { type: 'log', message: 'before-un' } as any,
      onUnmount: { type: 'log', message: 'after-un' } as any,
    };

    const { unmount } = renderHook(() => 
      useComponentLifecycle(mockDispatcher, lifetime)
    );

    unmount();
    expect(calls).toEqual(['before-un', 'after-un']);
  });

  it('should abort component when componentId is provided on unmount', () => {
    const { unmount } = renderHook(() => 
      useComponentLifecycle(mockDispatcher, {}, 'comp-1')
    );

    unmount();
    expect(mockDispatcher.abortComponent).toHaveBeenCalledWith('comp-1');
  });

  it('should normalize array of actions into a chain action in hooks', () => {
    const actions = [
      { type: 'log', message: 'a' } as any,
      { type: 'log', message: 'b' } as any,
    ];
    const lifetime = {
      onMount: actions,
    };

    renderHook(() => 
      useComponentLifecycle(mockDispatcher, lifetime)
    );

    expect(mockDispatcher.dispatch).toHaveBeenCalledWith({
      type: 'chain',
      actions: actions,
    });
  });
});
