import { useCallback } from 'react';
import { getErrorTracker } from '../errorTracker';

export function useErrorTracking() {
  const tracker = getErrorTracker();

  return {
    captureError: useCallback((err: Error, ctx?: Record<string, unknown>) => tracker.captureError(err, ctx), [tracker]),
    captureException: useCallback((err: unknown, ctx?: Record<string, unknown>) => tracker.captureException(err, ctx), [tracker]),
    captureMessage: useCallback((msg: string, level?: 'info' | 'warning' | 'error', ctx?: Record<string, unknown>) => tracker.captureMessage(msg, level, ctx), [tracker]),
    addBreadcrumb: useCallback((message: string, category?: string, data?: Record<string, unknown>) => tracker.addBreadcrumb(message, category, data), [tracker]),
    setUser: useCallback((userId: string | null, email?: string | null) => tracker.setUser(userId, email), [tracker]),
    setContext: useCallback((k: string, d: Record<string, unknown>) => tracker.setContext(k, d), [tracker]),
  };
}
