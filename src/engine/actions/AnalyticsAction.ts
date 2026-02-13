import { z } from 'zod';
import { AnalyticsActionSchema } from '../../schemas/actions';
import type { DispatchResult, ActionContext } from '../../schemas/actions';
import { logger } from '../../utils/logger';
import { EventFactory } from '../events/EventFactory';

export async function handleAnalytics(
  action: z.infer<typeof AnalyticsActionSchema>,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    // Track via context if available
    if (context.trackEvent) {
      context.trackEvent(action.event, action.properties);
    }

    // Fallback to window integrations
    const win = typeof window !== 'undefined' ? window as Window & {
      gtag?: (...args: unknown[]) => void;
      analytics?: { track: (event: string, properties?: Record<string, unknown>) => void };
      mixpanel?: { track: (event: string, properties?: Record<string, unknown>) => void };
    } : undefined;

    if (!win) {
      // Emit analytics event even if no window
      await EventFactory.analytics(action.event, action.properties, action.provider);
      return { success: true };
    }

    switch (action.provider) {
      case 'gtag':
        if (win.gtag) {
          win.gtag('event', action.event, action.properties);
        }
        break;
      case 'segment':
        if (win.analytics) {
          win.analytics.track(action.event, action.properties);
        }
        break;
      case 'mixpanel':
        if (win.mixpanel) {
          win.mixpanel.track(action.event, action.properties);
        }
        break;
    }

    logger.info(`[Analytics] ${action.event}`, action.properties);

    // Emit analytics event
    await EventFactory.analytics(action.event, action.properties, action.provider);

    return { success: true };
  } catch (error) {
    // Analytics failures shouldn't break the user flow
    logger.warn('[Analytics] Failed:', error);

    // Emit analytics error event
    await EventFactory.analyticsError((error as Error).message, action.provider);

    return { success: true }; // Return success to continue flow
  }
}