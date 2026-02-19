import React, { useState, useEffect, Suspense } from 'react';
import { useInterpolation } from '../../engine/hooks/useInterpolation';
import { renderSection } from '../../engine/utils/renderSection';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';
import secureSession from '../../utils/secureSession';
import { logger } from '@/utils/logger';

interface LoadFromApiProps {
  endpoint: string;
  method?: string;
  onError?: Action;
  dispatcher?: ActionDispatcher;
  state?: Record<string, unknown>;
  slug?: string;
  stepId?: string;
  variant?: string;
  // Cache configuration
  cacheEnabled?: boolean;
  cacheKey?: string;
  ttl?: number; // Time to live in milliseconds
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const LoadFromApi: React.FC<LoadFromApiProps> = ({
  endpoint,
  method = 'GET',
  onError,
  dispatcher,
  state = {},
  slug,
  stepId,
  variant,
  cacheEnabled = false,
  cacheKey,
  ttl = 5 * 60 * 1000, // 5 minutes default
}) => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { interpolateObject } = useInterpolation();

  // Generate cache key if not provided
  const actualCacheKey = cacheKey || `lp_factory_api_${btoa(endpoint)}_${method}`;

  // Cache utility functions
  const getCacheEntry = (key: string): CacheEntry | null => {
    try {
      const cached = secureSession.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);
      const now = Date.now();

      // Check if cache entry has expired
      if (now - entry.timestamp > entry.ttl) {
        secureSession.removeItem(key);
        return null;
      }

      return entry;
    } catch (err) {
      logger.warn('LoadFromApi: Failed to read from cache:', err);
      return null;
    }
  };

  const setCacheEntry = (key: string, data: any, ttlMs: number) => {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
      };
      secureSession.setItem(key, JSON.stringify(entry));
    } catch (err) {
      logger.warn('LoadFromApi: Failed to write to cache:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Check cache first if enabled
      if (cacheEnabled) {
        const cachedEntry = getCacheEntry(actualCacheKey);
        if (cachedEntry) {
          logger.debug('LoadFromApi: Using cached data for', endpoint);
          if (cachedEntry.data.sections && Array.isArray(cachedEntry.data.sections)) {
            setSections(cachedEntry.data.sections);
            setLoading(false);
            return;
          }
        }
      }

      // Fetch from API
      try {
        const response = await fetch(endpoint, { method });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.sections && Array.isArray(data.sections)) {
          setSections(data.sections);

          // Cache successful response if enabled
          if (cacheEnabled) {
            setCacheEntry(actualCacheKey, data, ttl);
            logger.debug(`LoadFromApi: Cached response for ${endpoint} TTL: ${ttl}ms`);
          }
        } else {
          throw new Error('Invalid response format: missing sections array');
        }

        setLoading(false);
      } catch (err) {
        logger.error('LoadFromApi fetch error:', err);
        setError((err as Error).message);
        setLoading(false);

        if (onError && dispatcher) {
          dispatcher.dispatch(onError).catch(dispatchErr => {
            logger.error('Error dispatching onError action:', dispatchErr);
          });
        }
      }
    };

    fetchData();
  }, [endpoint, method, onError, dispatcher, cacheEnabled, actualCacheKey, ttl]);

  if (loading) {
    return <div className="text-center p-4">Loading components...</div>;
  }

  if (error) {
    // Error is handled by onError action, so don't render anything
    return null;
  }

  return (
    <Suspense fallback={<div className="text-center p-4">Loading components...</div>}>
      {sections.map((section, index) =>
        renderSection({
          section,
          index,
          interpolateObject,
          engineState: state,
          dispatcher: dispatcher!,
          slug: slug!,
          stepId,
          variant,
        })
      )}
    </Suspense>
  );
};

export default LoadFromApi;