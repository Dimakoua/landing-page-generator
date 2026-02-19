import type { ErrorTracker, Severity } from '../types';

/**
 * Forwards calls to multiple providers. Useful for using both
 * console logging and external tracking (like Sentry) at the same time.
 */
export class CompositeProvider implements ErrorTracker {
  private providers: ErrorTracker[];

  constructor(providers: ErrorTracker[]) {
    this.providers = providers;
  }

  captureError(error: Error, context?: Record<string, unknown>) {
    this.providers.forEach(p => p.captureError(error, context));
  }

  captureException(error: unknown, context?: Record<string, unknown>) {
    this.providers.forEach(p => p.captureException(error, context));
  }

  captureMessage(message: string, level: Severity = 'info', context?: Record<string, unknown>) {
    this.providers.forEach(p => p.captureMessage(message, level, context));
  }

  setUser(userId: string | null, email?: string | null) {
    this.providers.forEach(p => p.setUser(userId, email));
  }

  setContext(key: string, data: Record<string, unknown>) {
    this.providers.forEach(p => p.setContext(key, data));
  }

  addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
    this.providers.forEach(p => p.addBreadcrumb(message, category, data));
  }

  async flush(timeout?: number): Promise<void> {
    await Promise.all(this.providers.map(p => p.flush(timeout)));
  }
}
