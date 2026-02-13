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

  // Save state to localStorage whenever it changes and broadcast change
  useEffect(() => {
    try {
      const payload = JSON.stringify(engineState);
      localStorage.setItem(storageKey, payload);
      logger.debug(`[useEngineState] State saved to localStorage (${storageKey}):`, engineState);

      // Broadcast an in-window custom event so other EngineRenderer instances update immediately
      try {
        const event = new CustomEvent('lp_engine_state_changed', { detail: { key: storageKey, state: engineState } });
        window.dispatchEvent(event);
      } catch (err) {
        // ignore custom event failures
      }
    } catch (error) {
      console.warn('[useEngineState] Failed to save state to localStorage:', error);
    }
  }, [engineState, storageKey]);

  // Listen for external updates to the same storage key (cross-window via 'storage' and in-window via custom event)
  useEffect(() => {
    const storageHandler = (ev: StorageEvent) => {
      if (!ev.key) return;
      if (ev.key !== storageKey) return;
      try {
        const parsed = ev.newValue ? JSON.parse(ev.newValue) : {};
        setEngineState(parsed);
      } catch (err) {
        // ignore parse errors
      }
    };

    const customHandler = (ev: any) => {
      try {
        if (ev?.detail?.key !== storageKey) return;
        setEngineState(ev.detail.state || {});
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener('lp_engine_state_changed', customHandler as EventListener);

    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('lp_engine_state_changed', customHandler as EventListener);
    };
  }, [storageKey]);

  return [engineState, setEngineState] as const;
}
