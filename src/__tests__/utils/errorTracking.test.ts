import { describe, it, expect, vi, afterEach } from 'vitest';
import { ConsoleProvider } from '@/utils/errorTracking/providers/console';
import { getErrorTracker, setErrorTracker, resetErrorTracker } from '@/utils/errorTracking/errorTracker';

describe('ErrorTracking (provider-agnostic)', () => {
  afterEach(() => {
    resetErrorTracker();
    vi.restoreAllMocks();
  });

  it('returns a ConsoleProvider by default', () => {
    const tracker = getErrorTracker();
    expect(tracker).toBeDefined();
    expect((tracker as any).__getBreadcrumbs).toBeDefined();
  });

  it('allows swapping provider via setErrorTracker', () => {
    const mockProvider = {
      captureError: vi.fn(),
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      setUser: vi.fn(),
      setContext: vi.fn(),
      addBreadcrumb: vi.fn(),
      flush: vi.fn().mockResolvedValue(undefined),
    } as any;

    setErrorTracker(mockProvider);
    const t = getErrorTracker();
    t.captureMessage('hi', 'info');
    expect(mockProvider.captureMessage).toHaveBeenCalledWith('hi', 'info');
  });

  it('ConsoleProvider records breadcrumbs', () => {
    const consoleProv = new ConsoleProvider();
    consoleProv.addBreadcrumb('one', 'test', { a: 1 });
    const crumbs = (consoleProv as any).__getBreadcrumbs();
    expect(crumbs.length).toBeGreaterThan(0);
    expect(crumbs[crumbs.length - 1].message).toBe('one');
  });
});
