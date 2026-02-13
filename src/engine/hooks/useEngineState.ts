import { useEffect, useState } from 'react';
import type { Layout } from '../../schemas';
import { logger } from '../../utils/logger';

/**
 * Manages engine state persistence and loading
 */
export function useEngineState(layout: Layout, slug: string, variant?: string) {
  const storageKey = variant ? `lp_factory_state_${slug}_${variant}` : `lp_factory_state_${slug}`;

  /**
   * Load initial state from localStorage
   */
  const loadInitialState = (): Record<string, unknown> => {
    try {
      let stored = localStorage.getItem(storageKey);

      // If not found, try without variant as fallback
      if (!stored && variant) {
        const fallbackKey = `lp_factory_state_${slug}`;
        stored = localStorage.getItem(fallbackKey);
        if (stored) {
          logger.debug(`[useEngineState] Using fallback storage key: ${fallbackKey}`);
        }
      }

      const persistedState = stored ? JSON.parse(stored) : {};

      // Merge layout-defined state with persisted state
      // Persisted state takes precedence (user-modified values)
      const mergedState = layout.state ? { ...layout.state, ...persistedState } : persistedState;

      logger.debug(`[useEngineState] Loading state from localStorage (${storageKey}):`, mergedState);
      return mergedState;
    } catch (error) {
      console.warn('[useEngineState] Failed to load state from localStorage:', error);
      return layout.state || {};
    }
  };

  const [engineState, setEngineState] = useState<Record<string, unknown>>(loadInitialState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(engineState));
      logger.debug(`[useEngineState] State saved to localStorage (${storageKey}):`, engineState);
    } catch (error) {
      console.warn('[useEngineState] Failed to save state to localStorage:', error);
    }
  }, [engineState, storageKey]);

  return [engineState, setEngineState] as const;
}
