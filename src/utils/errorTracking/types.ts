export type Severity = 'info' | 'warning' | 'error';

export interface Breadcrumb {
  message: string;
  category?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface ErrorTracker {
  captureError(error: Error, context?: Record<string, unknown>): void;
  captureException(error: unknown, context?: Record<string, unknown>): void;
  captureMessage(message: string, level?: Severity, context?: Record<string, unknown>): void;
  setUser(userId: string | null, email?: string | null): void;
  setContext(key: string, data: Record<string, unknown>): void;
  addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>): void;
  flush(timeout?: number): Promise<void>;
}
