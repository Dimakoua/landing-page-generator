import { useState } from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

/**
 * Hook to manage loading states for action dispatching.
 * Provides a dispatch function that sets loading state for a given key.
 */
export const useActionDispatch = (dispatcher?: ActionDispatcher) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const dispatchWithLoading = async (key: string, action?: Action) => {
    if (!action || !dispatcher) return;

    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      await dispatcher.dispatch(action);
    } catch (err) {
      console.error(`Action dispatch failed for ${key}:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return { loading, dispatchWithLoading };
};