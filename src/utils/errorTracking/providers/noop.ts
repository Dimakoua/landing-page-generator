import type { ErrorTracker, Severity } from '../types';

/**
 * Silent provider that does nothing. Useful for local development
 * when you want to disable tracking or when tracking is not enabled.
 */
export class NoopProvider implements ErrorTracker {
  captureError(_error: Error, _context?: Record<string, unknown>) {
    void _error;
    void _context;
  }
  captureException(_error: unknown, _context?: Record<string, unknown>) {
    void _error;
    void _context;
  }
  captureMessage(_message: string, _level: Severity = 'info', _context?: Record<string, unknown>) {
    void _message;
    void _level;
    void _context;
  }
  setUser(_userId: string | null, _email?: string | null) {
    void _userId;
    void _email;
  }
  setContext(_key: string, _data: Record<string, unknown>) {
    void _key;
    void _data;
  }
  addBreadcrumb(_message: string, _category?: string, _data?: Record<string, unknown>) {
    void _message;
    void _category;
    void _data;
  }
  async flush(_timeout?: number): Promise<void> {
    void _timeout;
    return Promise.resolve();
  }
}
