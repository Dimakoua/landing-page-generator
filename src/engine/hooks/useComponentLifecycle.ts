import { useEffect, useRef } from 'react';
import type { ActionDispatcher } from '../ActionDispatcher';
import { type LifetimeActions } from '../../schemas/actions';
import { normalizeActionOrArray } from '../utils/actionUtils';

/**
 * Module-level registry tracking active lifecycle executions.
 * Survives StrictMode's mount/unmount/remount cycle via cleanup scheduling.
 * Maps componentId -> { beforeMountExecuted: boolean, onMountExecuted: boolean, cleanupTimer: NodeJS.Timeout | null }
 */
const lifecycleRegistry = new Map<string, { 
  beforeMountExecuted: boolean; 
  onMountExecuted: boolean; 
  cleanupTimer: ReturnType<typeof setTimeout> | null 
}>();

/**
 * useComponentLifecycle Hook
 * Executes declarative actions at key points in the React component lifecycle.
 * Automatically handles AbortController registration for async operations.
 * 
 * Protects against React StrictMode double-invocation by tracking execution state
 * that persists through unmount/remount but cleans up after component is truly destroyed.
 */
export function useComponentLifecycle(
  dispatcher: ActionDispatcher,
  lifetime?: LifetimeActions,
  componentId?: string
) {
  const isInitialized = useRef(false);
  const hasExecutedOnMount = useRef(false);

  // beforeMount (runs during render phase, only once per component instance)
  // Use registry for StrictMode protection when componentId is available
  // eslint-disable-next-line react-hooks/refs
  if (!isInitialized.current) {
    isInitialized.current = true;
    if (lifetime?.beforeMount) {
      if (componentId) {
        const entry = lifecycleRegistry.get(componentId);
        
        // Cancel any pending cleanup since we're remounting
        if (entry?.cleanupTimer) {
          clearTimeout(entry.cleanupTimer);
        }
        
        // Only execute if not already executed for this componentId
        if (!entry?.beforeMountExecuted) {
          lifecycleRegistry.set(componentId, { 
            beforeMountExecuted: true, 
            onMountExecuted: entry?.onMountExecuted ?? false,
            cleanupTimer: null 
          });
          dispatcher.dispatch(normalizeActionOrArray(lifetime.beforeMount));
        }
      } else {
        // No componentId: execute (local ref prevents double in same instance only)
        dispatcher.dispatch(normalizeActionOrArray(lifetime.beforeMount));
      }
    }
  }

  useEffect(() => {
    // onMount - guard against StrictMode double-invocation
    if (lifetime?.onMount) {
      if (componentId) {
        const entry = lifecycleRegistry.get(componentId);
        
        // Cancel any pending cleanup since we're remounting
        if (entry?.cleanupTimer) {
          clearTimeout(entry.cleanupTimer);
        }

        // Only execute if not already executed for this componentId
        if (!entry?.onMountExecuted) {
          lifecycleRegistry.set(componentId, { 
            beforeMountExecuted: entry?.beforeMountExecuted ?? false,
            onMountExecuted: true, 
            cleanupTimer: null 
          });
          hasExecutedOnMount.current = true;
          dispatcher.dispatch(normalizeActionOrArray(lifetime.onMount));
        }
      } else {
        // No componentId: check local ref to prevent double execution within same instance
        if (!hasExecutedOnMount.current) {
          hasExecutedOnMount.current = true;
          dispatcher.dispatch(normalizeActionOrArray(lifetime.onMount));
        }
      }
    }

    return () => {
      // beforeUnmount
      if (lifetime?.beforeUnmount) {
        dispatcher.dispatch(normalizeActionOrArray(lifetime.beforeUnmount));
      }

      // Abort component operations
      if (componentId) {
        dispatcher.abortComponent(componentId);
      }

      // onUnmount
      if (lifetime?.onUnmount) {
        dispatcher.dispatch(normalizeActionOrArray(lifetime.onUnmount));
      }

      // Schedule cleanup of registry entry after a delay
      // This allows StrictMode's immediate remount to cancel the cleanup
      // but ensures real unmounts eventually clean up the registry
      if (componentId && (lifetime?.onMount || lifetime?.beforeMount)) {
        const entry = lifecycleRegistry.get(componentId);
        if (entry) {
          const cleanupTimer = setTimeout(() => {
            lifecycleRegistry.delete(componentId);
          }, 1000); // 1 second should be enough for StrictMode remount
          
          entry.cleanupTimer = cleanupTimer;
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
