import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAnalytics } from '@/engine/actions/AnalyticsAction';
import type { ActionContext } from '@/schemas/actions';
import { logger } from '@/utils/logger';

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  }
}));

describe('AnalyticsAction', () => {
  let mockContext: ActionContext;
  let mockWindow: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockContext = {
      navigate: vi.fn(),
      getState: vi.fn(),
      setState: vi.fn(),
      formData: {},
    };

    // Mock window analytics objects
    mockWindow = {
      gtag: vi.fn(),
      analytics: { track: vi.fn() },
      mixpanel: { track: vi.fn() },
    };
    global.window = mockWindow as any;
  });

  it('should track event via context.trackEvent when available', async () => {
    mockContext.trackEvent = vi.fn();
    const action = { type: 'analytics' as const, event: 'cta_clicked', provider: 'gtag' as const };

    const result = await handleAnalytics(action, mockContext);

    expect(mockContext.trackEvent).toHaveBeenCalledWith('cta_clicked', undefined);
    expect(result.success).toBe(true);
  });

  it('should track event with properties via context', async () => {
    mockContext.trackEvent = vi.fn();
    const props = { page: 'home', variant: 'A' };
    const action = { type: 'analytics' as const, event: 'page_view', properties: props, provider: 'gtag' as const };

    const result = await handleAnalytics(action, mockContext);

    expect(mockContext.trackEvent).toHaveBeenCalledWith('page_view', props);
    expect(result.success).toBe(true);
  });

  it('should fallback to gtag when available', async () => {
    const action = { type: 'analytics' as const, event: 'purchase', provider: 'gtag' as const };

    const result = await handleAnalytics(action, mockContext);

    expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'purchase', undefined);
    expect(logger.info).toHaveBeenCalledWith('[Analytics] purchase', undefined);
    expect(result.success).toBe(true);
  });

  it('should fallback to segment when provider is segment', async () => {
    const props = { revenue: 99.99 };
    const action = { type: 'analytics' as const, event: 'checkout', properties: props, provider: 'segment' as const };

    const result = await handleAnalytics(action, mockContext);

    expect(mockWindow.analytics.track).toHaveBeenCalledWith('checkout', props);
    expect(result.success).toBe(true);
  });

  it('should fallback to mixpanel when provider is mixpanel', async () => {
    const props = { plan: 'premium' };
    const action = { type: 'analytics' as const, event: 'upgrade', properties: props, provider: 'mixpanel' as const };

    const result = await handleAnalytics(action, mockContext);

    expect(mockWindow.mixpanel.track).toHaveBeenCalledWith('upgrade', props);
    expect(result.success).toBe(true);
  });

  it('should not fail when window is undefined (SSR)', async () => {
    global.window = undefined as any;
    const action = { type: 'analytics' as const, event: 'test', provider: 'gtag' as const };

    const result = await handleAnalytics(action, mockContext);

    expect(result.success).toBe(true);
  });

  it('should not fail when analytics provider is not available', async () => {
    global.window = {} as any;
    const action = { type: 'analytics' as const, event: 'test', provider: 'gtag' as const };

    const result = await handleAnalytics(action, mockContext);

    expect(result.success).toBe(true);
  });

  it('should always return success even on errors', async () => {
    mockContext.trackEvent = vi.fn().mockImplementation(() => {
      throw new Error('Tracking failed');
    });
    const action = { type: 'analytics' as const, event: 'error_test', provider: 'gtag' as const };

    const result = await handleAnalytics(action, mockContext);

    expect(result.success).toBe(true); // Should not break flow
    expect(logger.warn).toHaveBeenCalledWith('[Analytics] Failed:', expect.any(Error));
  });
});
