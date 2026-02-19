import { describe, it, expect, vi } from 'vitest';
import { NoopProvider, CompositeProvider, SentryProvider } from '@/utils/errorTracking';

describe('Error Tracking Providers', () => {
  describe('NoopProvider', () => {
    it('executes without throwing any errors', () => {
      const provider = new NoopProvider();
      expect(() => {
        provider.captureMessage('test');
        provider.captureError(new Error('test'));
        provider.setUser('123');
        provider.addBreadcrumb('test');
        provider.flush();
      }).not.toThrow();
    });
  });

  describe('CompositeProvider', () => {
    it('forwards all calls to all underlying providers', async () => {
      const p1 = {
        captureMessage: vi.fn(),
        captureError: vi.fn(),
        captureException: vi.fn(),
        setUser: vi.fn(),
        setContext: vi.fn(),
        addBreadcrumb: vi.fn(),
        flush: vi.fn().mockResolvedValue(undefined),
      };
      const p2 = {
        captureMessage: vi.fn(),
        captureError: vi.fn(),
        captureException: vi.fn(),
        setUser: vi.fn(),
        setContext: vi.fn(),
        addBreadcrumb: vi.fn(),
        flush: vi.fn().mockResolvedValue(undefined),
      };

      const composite = new CompositeProvider([p1 as any, p2 as any]);

      composite.captureMessage('msg', 'info', { foo: 'bar' });
      expect(p1.captureMessage).toHaveBeenCalledWith('msg', 'info', { foo: 'bar' });
      expect(p2.captureMessage).toHaveBeenCalledWith('msg', 'info', { foo: 'bar' });

      composite.setUser('user1');
      expect(p1.setUser).toHaveBeenCalledWith('user1', undefined);
      expect(p2.setUser).toHaveBeenCalledWith('user1', undefined);

      await composite.flush();
      expect(p1.flush).toHaveBeenCalled();
      expect(p2.flush).toHaveBeenCalled();
    });
  });

  describe('SentryProvider', () => {
    it('forwards to sentry instance if provided', () => {
      const mockSentry = {
        captureException: vi.fn(),
        captureMessage: vi.fn(),
        setUser: vi.fn(),
        setContext: vi.fn(),
        addBreadcrumb: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
      };
      const provider = new SentryProvider(mockSentry);

      provider.captureError(new Error('error'));
      expect(mockSentry.captureException).toHaveBeenCalled();

      provider.setUser('user123');
      expect(mockSentry.setUser).toHaveBeenCalledWith({ id: 'user123', email: undefined });
    });

    it('handles missing sentry instance gracefully', () => {
      const provider = new SentryProvider();
      expect(() => {
        provider.captureMessage('test');
        provider.setUser('123');
      }).not.toThrow();
    });
  });
});
