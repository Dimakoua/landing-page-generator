import { globalEventBus, EVENT_TYPES } from './EventBus';
import type {
  StateUpdatedEvent,
  NavigateEvent,
  RedirectEvent,
  ApiSuccessEvent,
  ApiErrorEvent,
  AnalyticsEvent,
  AnalyticsErrorEvent,
  LogEvent,
  UserInteractionEvent,
  ActionStartedEvent,
  ActionCompletedEvent,
  ActionErrorEvent,
  CartUpdatedEvent,
  ComponentMountedEvent,
  ComponentUnmountedEvent,
  ComponentErrorEvent,
} from '../../schemas/events';

/**
 * EventFactory: Factory methods for emitting typed events
 *
 * Reduces boilerplate by ~40% compared to direct globalEventBus.emit()
 *
 * Benefits:
 * - Single source of truth for event shapes
 * - Prevents typos in event payloads
 * - Consistent event structure across codebase
 * - Easier to refactor event shapes in one place
 *
 * Usage:
 * ```typescript
 * // ❌ Before (repetitive)
 * await globalEventBus.emit(EVENT_TYPES.STATE_UPDATED, {
 *   type: EVENT_TYPES.STATE_UPDATED,
 *   key: action.key,
 *   value: action.value,
 *   previousValue,
 *   source: 'SetStateAction',
 * });
 *
 * // ✅ After (one-liner)
 * await EventFactory.stateUpdated(action.key, action.value, previousValue, 'SetStateAction');
 * ```
 */
export const EventFactory = {
  /**
   * Emit STATE_UPDATED event when state changes
   * Handles: key, value, previousValue, source
   */
  async stateUpdated(
    key: string,
    value: unknown,
    previousValue: unknown | undefined,
    source: string
  ): Promise<void> {
    const event: StateUpdatedEvent = {
      type: EVENT_TYPES.STATE_UPDATED,
      key,
      value,
      previousValue,
      source,
    };
    await globalEventBus.emit(EVENT_TYPES.STATE_UPDATED, event);
  },

  /**
   * Emit NAVIGATE event for step/internal navigation
   */
  async navigate(
    url: string,
    replace?: boolean,
    source?: string
  ): Promise<void> {
    const event: NavigateEvent = {
      type: EVENT_TYPES.NAVIGATE,
      url,
      replace,
      source,
    };
    await globalEventBus.emit(EVENT_TYPES.NAVIGATE, event);
  },

  /**
   * Emit REDIRECT event for external redirects
   */
  async redirect(
    url: string,
    target?: string,
    source?: string
  ): Promise<void> {
    const event: RedirectEvent = {
      type: EVENT_TYPES.REDIRECT,
      url,
      target,
      source,
    };
    await globalEventBus.emit(EVENT_TYPES.REDIRECT, event);
  },

  /**
   * Emit API_SUCCESS event when API call succeeds
   */
  async apiSuccess(
    url: string,
    method: string,
    response?: unknown,
    duration?: number
  ): Promise<void> {
    const event: ApiSuccessEvent = {
      type: EVENT_TYPES.API_SUCCESS,
      url,
      method,
      response,
      duration,
    };
    await globalEventBus.emit(EVENT_TYPES.API_SUCCESS, event);
  },

  /**
   * Emit API_ERROR event when API call fails
   */
  async apiError(
    url: string,
    method: string,
    error: string,
    statusCode?: number,
    duration?: number
  ): Promise<void> {
    const event: ApiErrorEvent = {
      type: EVENT_TYPES.API_ERROR,
      url,
      method,
      error,
      statusCode,
      duration,
    };
    await globalEventBus.emit(EVENT_TYPES.API_ERROR, event);
  },

  /**
   * Emit ANALYTICS_EVENT for event tracking
   */
  async analytics(
    event: string,
    properties?: Record<string, unknown>,
    provider?: string
  ): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      type: EVENT_TYPES.ANALYTICS_EVENT,
      event,
      properties,
      provider,
    };
    await globalEventBus.emit(EVENT_TYPES.ANALYTICS_EVENT, analyticsEvent);
  },

  /**
   * Emit ANALYTICS_ERROR when analytics fails
   */
  async analyticsError(
    error: string,
    provider?: string
  ): Promise<void> {
    const event: AnalyticsErrorEvent = {
      type: EVENT_TYPES.ANALYTICS_ERROR,
      error,
      provider,
    };
    await globalEventBus.emit(EVENT_TYPES.ANALYTICS_ERROR, event);
  },

  /**
   * Emit LOG_EVENT for logging
   */
  async log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: unknown
  ): Promise<void> {
    const event: LogEvent = {
      type: EVENT_TYPES.LOG_EVENT,
      level,
      message,
      data,
    };
    await globalEventBus.emit(EVENT_TYPES.LOG_EVENT, event);
  },

  /**
   * Emit USER_INTERACTION event
   */
  async userInteraction(
    action: string,
    component: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const event: UserInteractionEvent = {
      type: EVENT_TYPES.USER_INTERACTION,
      action,
      component,
      data,
    };
    await globalEventBus.emit(EVENT_TYPES.USER_INTERACTION, event);
  },

  /**
   * Emit ACTION_STARTED when an action begins
   */
  async actionStarted(
    actionType: string,
    actionId?: string,
    component?: string
  ): Promise<void> {
    const event: ActionStartedEvent = {
      type: EVENT_TYPES.ACTION_STARTED,
      actionType,
      actionId,
      component,
    };
    await globalEventBus.emit(EVENT_TYPES.ACTION_STARTED, event);
  },

  /**
   * Emit ACTION_COMPLETED when an action finishes
   */
  async actionCompleted(
    actionType: string,
    result?: unknown,
    actionId?: string,
    duration?: number
  ): Promise<void> {
    const event: ActionCompletedEvent = {
      type: EVENT_TYPES.ACTION_COMPLETED,
      actionType,
      actionId,
      result,
      duration,
    };
    await globalEventBus.emit(EVENT_TYPES.ACTION_COMPLETED, event);
  },

  /**
   * Emit ACTION_ERROR when an action fails
   */
  async actionError(
    actionType: string,
    error: string,
    component?: string,
    actionId?: string
  ): Promise<void> {
    const event: ActionErrorEvent = {
      type: EVENT_TYPES.ACTION_ERROR,
      actionType,
      actionId,
      error,
      component,
    };
    await globalEventBus.emit(EVENT_TYPES.ACTION_ERROR, event);
  },

  /**
   * Emit CART_UPDATED when cart state changes
   */
  async cartUpdated(
    items: unknown[],
    total?: number,
    source?: string
  ): Promise<void> {
    const event: CartUpdatedEvent = {
      type: EVENT_TYPES.CART_UPDATED,
      items,
      total,
      source,
    };
    await globalEventBus.emit(EVENT_TYPES.CART_UPDATED, event);
  },

  /**
   * Emit COMPONENT_MOUNTED when a component mounts
   */
  async componentMounted(
    component: string,
    props?: Record<string, unknown>
  ): Promise<void> {
    const event: ComponentMountedEvent = {
      type: EVENT_TYPES.COMPONENT_MOUNTED,
      component,
      props,
    };
    await globalEventBus.emit(EVENT_TYPES.COMPONENT_MOUNTED, event);
  },

  /**
   * Emit COMPONENT_UNMOUNTED when a component unmounts
   */
  async componentUnmounted(
    component: string
  ): Promise<void> {
    const event: ComponentUnmountedEvent = {
      type: EVENT_TYPES.COMPONENT_UNMOUNTED,
      component,
    };
    await globalEventBus.emit(EVENT_TYPES.COMPONENT_UNMOUNTED, event);
  },

  /**
   * Emit COMPONENT_ERROR when a component has an error
   */
  async componentError(
    component: string,
    error: string,
    stack?: string
  ): Promise<void> {
    const event: ComponentErrorEvent = {
      type: EVENT_TYPES.COMPONENT_ERROR,
      component,
      error,
      stack,
    };
    await globalEventBus.emit(EVENT_TYPES.COMPONENT_ERROR, event);
  },
};
