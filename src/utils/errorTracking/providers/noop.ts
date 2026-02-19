import type { ErrorTracker, Severity } from '../types';

/**
 * Silent provider that does nothing. Useful for local development
 * when you want to disable tracking or when tracking is not enabled.
 */
export class NoopProvider implements ErrorTracker {
  captureError(_error: Error, _context?: Record<string, unknown>) {}
  captureException(_error: unknown, _context?: Record<string, unknown>) {}
  captureMessage(_message: string, _level: Severity = 'info', _context?: Record<string, unknown>) {}
  setUser(_userId: string | null, _email?: string | null) {}
  setContext(_key: string, _data: Record<string, unknown>) {}
  addBreadcrumb(_message: string, _category?: string, _data?: Record<string, unknown>) {}
  async flush(_timeout?: number): Promise<void> {
    return Promise.resolve();
  }
}
