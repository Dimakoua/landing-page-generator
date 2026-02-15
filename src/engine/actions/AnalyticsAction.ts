import type { DispatchResult, ActionContext, Action } from '../../schemas/actions';
import { logger } from '../../utils/logger';
import { trackEvent } from '../../utils/analytics';

type AnalyticsAction = Extract<Action, { type: 'analytics' }>;

export async function handleAnalytics(
  action: AnalyticsAction,
  context: ActionContext
): Promise<DispatchResult> {
  try {
    // Track via context if available (takes precedence)
    if (context.trackEvent) {
      context.trackEvent(action.event, action.properties);
    }

    // Use central analytics utility for provider-specific tracking
    trackEvent(action.event, action.properties, action.provider);

    logger.info(`[Analytics] ${action.event}`, action.properties);
    return { success: true };
  } catch (error) {
    // Analytics failures shouldn't break the user flow
    logger.warn('[Analytics] Failed:', error);
    return { success: true }; // Return success to continue flow
  }
}