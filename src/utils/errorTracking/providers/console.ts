import type { Breadcrumb, ErrorTracker, Severity } from '../types';

export class ConsoleProvider implements ErrorTracker {
  private breadcrumbs: Breadcrumb[] = [];

  captureError(error: Error, context?: Record<string, unknown>) {
    // Preserve original behavior but make it visible to the tracker abstraction
    console.error('[ErrorTracker][error]', error, context || {});
    this.addBreadcrumb('captureError', 'error', { message: error.message, ...(context || {}) });
  }

  captureException(error: unknown, context?: Record<string, unknown>) {
    console.error('[ErrorTracker][exception]', error, context || {});
    this.addBreadcrumb('captureException', 'exception', { ...(context || {}) });
  }

  captureMessage(message: string, level: Severity = 'info', context?: Record<string, unknown>) {
    if (level === 'error') console.error('[ErrorTracker][message]', message, context || {});
    else if (level === 'warning') console.warn('[ErrorTracker][message]', message, context || {});
    else console.log('[ErrorTracker][message]', message, context || {});
    this.addBreadcrumb(message, 'message', context);
  }

  setUser(userId: string | null, email?: string | null) {
    console.debug('[ErrorTracker] setUser', { userId, email });
  }

  setContext(key: string, data: Record<string, unknown>) {
    console.debug('[ErrorTracker] setContext', key, data);
  }

  addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
    const b: Breadcrumb = { message, category, data, timestamp: Date.now() };
    this.breadcrumbs.push(b);
    // Keep breadcrumbs size reasonable
    if (this.breadcrumbs.length > 100) this.breadcrumbs.shift();
    console.debug('[ErrorTracker] breadcrumb', b);
  }

  async flush(): Promise<void> {
    // No-op for console provider
    return Promise.resolve();
  }

  // Test helper (not part of interface) to inspect breadcrumbs
  __getBreadcrumbs() {
    return this.breadcrumbs.slice();
  }
}
