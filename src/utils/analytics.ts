import { logger } from './logger';

export type AnalyticsProvider = 'gtag' | 'google_analytics' | 'segment' | 'mixpanel' | 'custom';

/**
 * Common interface for tracking events across the application.
 * Centralizes logic for different providers and handles window safety checks.
 */
export function trackEvent(
  event: string,
  properties?: any,
  provider: AnalyticsProvider = 'gtag'
) {
  if (typeof window === 'undefined') return;

  const win = window as any;
  const normalizedProvider = provider === 'google_analytics' ? 'gtag' : provider;

  try {
    switch (normalizedProvider) {
      case 'gtag':
        if (win.gtag) {
          win.gtag('event', event, properties);
        }
        break;
      case 'segment':
        if (win.analytics) {
          win.analytics.track(event, properties);
        }
        break;
      case 'mixpanel':
        if (win.mixpanel) {
          win.mixpanel.track(event, properties);
        }
        break;
      case 'custom':
        // Custom provider tracking handled externally or via context
        break;
    }

    logger.debug(`[Analytics:${normalizedProvider}] ${event}`, properties);
  } catch (error) {
    logger.warn(`[Analytics:${normalizedProvider}] Tracking failed:`, error);
  }
}

/**
 * Type declaration for global tracking functions
 */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    analytics?: { track: (event: string, properties?: any) => void };
    mixpanel?: { track: (event: string, properties?: any) => void };
  }
}
