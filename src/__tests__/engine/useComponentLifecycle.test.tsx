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

    // onMount should fire exactly once even if StrictMode remounts
    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(lifetime.onMount);
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    
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

  it('should prevent duplicate onMount execution during StrictMode remount', () => {
    const lifetime = {
      onMount: { type: 'log', message: 'mount' } as any,
    };

    const componentId = 'test-component-123';

    // First mount
    const { unmount } = renderHook(() => 
      useComponentLifecycle(mockDispatcher, lifetime, componentId)
    );

    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(lifetime.onMount);

    // Simulate what StrictMode does: unmount and immediate remount
    unmount();
    
    vi.clearAllMocks();
    
    // Immediate remount (within StrictMode's unmount/remount cycle) - should NOT dispatch again
    const { unmount: unmount2 } = renderHook(() => 
      useComponentLifecycle(mockDispatcher, lifetime, componentId)
    );
    
    expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    
    unmount2();
  });

  it('should cleanup registry after component is truly destroyed', async () => {
    vi.useFakeTimers();
    
    const lifetime = {
      onMount: { type: 'log', message: 'mount' } as any,
    };

    const componentId = 'test-component-cleanup';

    // Mount and unmount
    const { unmount } = renderHook(() => 
      useComponentLifecycle(mockDispatcher, lifetime, componentId)
    );

    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    unmount();
    
    // Fast-forward past cleanup timer (1 second)
    vi.advanceTimersByTime(1100);
    
    vi.clearAllMocks();
    
    // New mount after cleanup - should dispatch again
    const { unmount: unmount2 } = renderHook(() => 
      useComponentLifecycle(mockDispatcher, lifetime, componentId)
    );
    
    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(lifetime.onMount);
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    
    unmount2();
    vi.useRealTimers();
  });

  it('should handle onMount without componentId using local ref', () => {
    const lifetime = {
      onMount: { type: 'log', message: 'mount' } as any,
    };

    // No componentId provided
    const { rerender } = renderHook(() => 
      useComponentLifecycle(mockDispatcher, lifetime)
    );

    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(lifetime.onMount);
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);

    // Rerender shouldn't trigger again (same component instance)
    rerender();
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
  });
});
