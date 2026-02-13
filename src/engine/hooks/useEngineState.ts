import { useEffect, useState, useRef } from 'react';
import type { Layout } from '../../schemas';
import { logger } from '../../utils/logger';
import { globalEventBus } from '../events/EventBus';
import { EVENT_TYPES } from '../events/types';
import type { StateUpdatedEvent } from '../../schemas/events';

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
  const isUpdatingFromEvent = useRef(false);

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

  // Listen for STATE_UPDATED events from the event bus
  useEffect(() => {
    const handleStateUpdated = (event: StateUpdatedEvent) => {
      // Prevent infinite loops by checking if we're already updating from an event
      if (isUpdatingFromEvent.current) {
        return;
      }

      try {
        // Update local state with the new value
        setEngineState(prevState => {
          const newState = { ...prevState };
          newState[event.key] = event.value;
          return newState;
        });

        logger.debug(`[useEngineState] State updated from event (${event.key}):`, event.value);
      } catch (error) {
        logger.warn('[useEngineState] Failed to update state from event:', error);
      }
    };

    // Subscribe to STATE_UPDATED events
    const listenerId = globalEventBus.on(EVENT_TYPES.STATE_UPDATED, handleStateUpdated);

    return () => {
      // Unsubscribe when component unmounts
      globalEventBus.off(EVENT_TYPES.STATE_UPDATED, listenerId);
    };
  }, []);

  // Create a state setter that emits events
  const setStateWithEvent = (keyOrUpdater: string | Record<string, unknown> | ((prevState: Record<string, unknown>) => Record<string, unknown>), value?: unknown, merge?: boolean) => {
    if (typeof keyOrUpdater === 'function') {
      // Functional update - need to calculate what changed
      setEngineState(prevState => {
        const newState = keyOrUpdater(prevState);

        // Emit events for changed keys
        Object.keys(newState).forEach(key => {
          if (newState[key] !== prevState[key]) {
            globalEventBus.emit(EVENT_TYPES.STATE_UPDATED, {
              type: EVENT_TYPES.STATE_UPDATED,
              key,
              value: newState[key],
              previousValue: prevState[key],
              source: 'useEngineState',
            }).catch(err => logger.warn('[useEngineState] Failed to emit state update event:', err));
          }
        });

        return newState;
      });
    } else if (typeof keyOrUpdater === 'object') {
      // Object update (merge)
      setEngineState(prevState => {
        const newState = { ...prevState, ...keyOrUpdater };

        // Emit events for changed keys
        Object.keys(keyOrUpdater).forEach(key => {
          if ((keyOrUpdater as Record<string, unknown>)[key] !== prevState[key]) {
            globalEventBus.emit(EVENT_TYPES.STATE_UPDATED, {
              type: EVENT_TYPES.STATE_UPDATED,
              key,
              value: (keyOrUpdater as Record<string, unknown>)[key],
              previousValue: prevState[key],
              source: 'useEngineState',
            }).catch(err => logger.warn('[useEngineState] Failed to emit state update event:', err));
          }
        });

        return newState;
      });
    } else {
      // Key-value update
      const key = keyOrUpdater;
      const previousValue = engineState[key];
      setEngineState(prevState => {
        const newState = { ...prevState };
        if (merge && typeof newState[key] === 'object' && typeof value === 'object') {
          // Deep merge for objects
          newState[key] = { ...newState[key], ...value };
        } else {
          newState[key] = value;
        }
        return newState;
      });

      // Emit state updated event
      globalEventBus.emit(EVENT_TYPES.STATE_UPDATED, {
        type: EVENT_TYPES.STATE_UPDATED,
        key,
        value,
        previousValue,
        source: 'useEngineState',
      }).catch(err => logger.warn('[useEngineState] Failed to emit state update event:', err));
    }
  };

  return [engineState, setStateWithEvent] as const;
}
