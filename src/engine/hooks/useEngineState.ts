import { useEffect, useState, useRef, useCallback } from 'react';
import type { Layout } from '../../schemas';
import { logger } from '../../utils/logger';
import { eventBus, EngineEvents } from '../events/EventBus';
import secureSession from '../../utils/secureSession';

// Module-level cache to track which keys have already logged initialization
// This prevents duplicate logs in development with StrictMode
const initializedKeys = new Set<string>();

/**
 * Manages engine state persistence and loading
 */
export function useEngineState(layout: Layout, slug: string, variant?: string, skipInitializationLog = false) {
  const storageKey = variant ? `lp_factory_state_${slug}_${variant}` : `lp_factory_state_${slug}`;
  const isInternalUpdate = useRef(false);
  const isInitialMount = useRef(true);
  // eslint-disable-next-line react-hooks/purity
  const instanceId = useRef(Math.random().toString(36).substring(2, 11));

  /**
   * Load initial state from sessionStorage
   */
  const loadInitialState = useCallback((): Record<string, unknown> => {
    try {
      let stored = secureSession.getItem(storageKey);

      // If not found, try without variant as fallback
      if (!stored && variant) {
        const fallbackKey = `lp_factory_state_${slug}`;
        stored = secureSession.getItem(fallbackKey);
      }

      const persistedState = stored ? JSON.parse(stored) : {};

      // Merge layout-defined state with persisted state
      const base = layout.state ? { ...layout.state, ...persistedState } : persistedState;

      // Inject client environment info if not already present (browser only)
      try {
        if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
          const ua = navigator.userAgent || '';
          const platform = navigator.platform || '';
          const uaLower = (ua + ' ' + platform).toLowerCase();
          const detectOS = (s: string) => {
            if (/iphone|ipad|ipod|ios/.test(s)) return 'ios';
            if (/android/.test(s)) return 'android';
            if (/windows nt|win32|win64|wow64|win/.test(s)) return 'windows';
            if (/macintosh|mac os x/.test(s)) return 'macos';
            if (/linux/.test(s)) return 'linux';
            return 'unknown';
          };

          base.client = {
            ...(base.client || {}),
            userAgent: (base.client && (base.client as any).userAgent) || ua,
            platform: (base.client && (base.client as any).platform) || platform,
            os: (base.client && (base.client as any).os) || detectOS(uaLower),
          } as unknown as Record<string, unknown>;
        }
      } catch (err) {
        // Swallow — non-critical
      }

      return base;
    } catch (error) {
      if (!skipInitializationLog) {
        console.warn('[useEngineState] Failed to load state from sessionStorage:', error);
      }
      return layout.state || {};
    }
  }, [storageKey, variant, slug, layout.state, skipInitializationLog]);

  const [engineState, setEngineState] = useState<Record<string, unknown>>(loadInitialState);

  // Log initialization only once per storage key
  useEffect(() => {
    if (!skipInitializationLog && !initializedKeys.has(storageKey)) {
      logger.debug(`[useEngineState] Initialized state for (${storageKey})`);
      initializedKeys.add(storageKey);
    }
  }, [storageKey, skipInitializationLog]);

  // Save state to sessionStorage whenever it changes and broadcast change
  useEffect(() => {
    // Skip saving on initial mount (we just loaded it)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    try {
      const payload = JSON.stringify(engineState);
      secureSession.setItem(storageKey, payload);
      logger.debug(`[useEngineState] State saved to sessionStorage (${storageKey})`);

      // Broadcast via EventBus so other hooks/components update immediately
      eventBus.emit(EngineEvents.STATE_CHANGED, { 
        key: storageKey, 
        state: engineState, 
        source: instanceId.current 
      });
    } catch (error) {
      console.warn('[useEngineState] Failed to save state to sessionStorage:', error);
    }
  }, [engineState, storageKey]);

  // Listen for external updates to the same storage key (cross-window via 'storage' and in-window via EventBus)
  useEffect(() => {
    const storageHandler = (ev: StorageEvent) => {
      if (!ev.key || ev.key !== storageKey) return;
      try {
        let newValStr = ev.newValue || '';
        // If other windows stored an encrypted value (enc:...), decrypt it first
        if (typeof newValStr === 'string' && newValStr.startsWith('enc:')) {
          newValStr = secureSession.decryptString(newValStr) || '';
        }
        const newValue = newValStr ? JSON.parse(newValStr) : {};
        // Simple check to avoid redundant updates
        if (JSON.stringify(newValue) !== JSON.stringify(engineState)) {
          isInternalUpdate.current = true;
          setEngineState(newValue);
        }
      } catch {
        // ignore parse errors
      }
    };

    const unsubscribe = eventBus.on(EngineEvents.STATE_CHANGED, (detail: any) => {
      if (detail.key !== storageKey) return;
      if (detail.source === instanceId.current) return; // Ignore our own broadcasts
      
      // Deep check to avoid redundant updates
      if (JSON.stringify(detail.state) !== JSON.stringify(engineState)) {
        isInternalUpdate.current = true;
        setEngineState(detail.state || {});
      }
    });

    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener('storage', storageHandler);
      unsubscribe();
    };
  }, [storageKey, engineState]);

  return [engineState, setEngineState] as const;
}
