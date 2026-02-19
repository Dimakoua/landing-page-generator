import type { ErrorTracker, Severity } from '../types';

/**
 * Placeholder for Sentry. Note that this requires '@sentry/react' or similar.
 */
export class SentryProvider implements ErrorTracker {
  private sentry: any;

  constructor(sentry?: any) {
    this.sentry = sentry;
  }

  captureError(error: Error, context?: Record<string, unknown>) {
    // Note: In real setup, context would be mapped to tags or extra context
    this.sentry?.captureException(error, { extra: context });
  }

  captureException(error: unknown, context?: Record<string, unknown>) {
    this.sentry?.captureException(error, { extra: context });
  }

  captureMessage(message: string, level: Severity = 'info', context?: Record<string, unknown>) {
    this.sentry?.captureMessage(message, level, { extra: context });
  }

  setUser(userId: string | null, email?: string | null) {
    this.sentry?.setUser({ id: userId, email });
  }

  setContext(key: string, data: Record<string, unknown>) {
    this.sentry?.setContext(key, data);
  }

  addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
    this.sentry?.addBreadcrumb({ message, category, data });
  }

  async flush(timeout?: number): Promise<void> {
    return this.sentry?.close(timeout);
  }
}
