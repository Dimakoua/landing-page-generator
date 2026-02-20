import { useEffect, useRef } from 'react';
import type { ActionDispatcher } from '../ActionDispatcher';
import { type LifetimeActions } from '../../schemas/actions';
import { normalizeActionOrArray } from '../utils/actionUtils';

/**
 * useComponentLifecycle Hook
 * Executes declarative actions at key points in the React component lifecycle.
 * Automatically handles AbortController registration for async operations.
 */
export function useComponentLifecycle(
  dispatcher: ActionDispatcher,
  lifetime?: LifetimeActions,
  componentId?: string
) {
  const isInitialized = useRef(false);

  // beforeMount
  if (!isInitialized.current) {
    isInitialized.current = true;
    if (lifetime?.beforeMount) {
      // In SSR/Static rendering this won't run, 
      // but in React functional components this is as close to "before render" as we get
      dispatcher.dispatch(normalizeActionOrArray(lifetime.beforeMount));
    }
  }

  useEffect(() => {
    // onMount
    if (lifetime?.onMount) {
      dispatcher.dispatch(normalizeActionOrArray(lifetime.onMount));
    }

    return () => {
      // beforeUnmount
      if (lifetime?.beforeUnmount) {
        dispatcher.dispatch(normalizeActionOrArray(lifetime.beforeUnmount));
      }

      // Check for AbortController in dispatcher and abort it
      if (componentId) {
        dispatcher.abortComponent(componentId);
      }

      // onUnmount
      if (lifetime?.onUnmount) {
        dispatcher.dispatch(normalizeActionOrArray(lifetime.onUnmount));
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
