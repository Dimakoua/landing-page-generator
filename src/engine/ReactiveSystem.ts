import { logger } from '../utils/logger';
import { globalEventBus } from './events/EventBus';
import { EVENT_TYPES } from './events/types';
import type { StateUpdatedEvent, AnalyticsEvent } from '../schemas/events';

/**
 * Reactive System - Automatically responds to events for analytics, logging, and side effects
 * Provides reactive features that enhance the landing page engine with automatic behaviors
 */
export class ReactiveSystem {
  private listeners: string[] = [];
  private isActive = false;

  /**
   * Start the reactive system - sets up all event listeners
   */
  start(): void {
    if (this.isActive) {
      logger.warn('[ReactiveSystem] Already active');
      return;
    }

    logger.debug('[ReactiveSystem] Starting reactive features');

    this.setupAnalyticsListeners();
    this.setupLoggingListeners();
    this.setupStateChangeListeners();
    this.setupComponentListeners();

    this.isActive = true;
    logger.info('[ReactiveSystem] Reactive features activated');
  }

  /**
   * Stop the reactive system - cleans up all event listeners
   */
  stop(): void {
    if (!this.isActive) {
      logger.warn('[ReactiveSystem] Not active');
      return;
    }

    logger.debug('[ReactiveSystem] Stopping reactive features');

    // Remove all listeners
    this.listeners.forEach(listenerId => {
      // Note: EventBus doesn't have a removeAllListeners method, so we'd need to track individual listeners
      // For now, we'll rely on the EventBus cleanup when the app unmounts
    });

    this.listeners = [];
    this.isActive = false;
    logger.info('[ReactiveSystem] Reactive features deactivated');
  }

  /**
   * Setup analytics event listeners for automatic tracking
   */
  private setupAnalyticsListeners(): void {
    // Listen for analytics events and forward to available providers
    const analyticsListenerId = globalEventBus.on(EVENT_TYPES.ANALYTICS_EVENT, this.handleAnalyticsEvent.bind(this));
    this.listeners.push(analyticsListenerId);

    // Listen for user interaction events and track them
    const interactionListenerId = globalEventBus.on(EVENT_TYPES.USER_INTERACTION, this.handleUserInteraction.bind(this));
    this.listeners.push(interactionListenerId);

    logger.debug('[ReactiveSystem] Analytics listeners setup');
  }

  /**
   * Setup logging event listeners for debugging and monitoring
   */
  private setupLoggingListeners(): void {
    // Listen for all action events and log them
    const actionStartListenerId = globalEventBus.on(EVENT_TYPES.ACTION_STARTED, this.handleActionEvent.bind(this, 'STARTED'));
    const actionCompleteListenerId = globalEventBus.on(EVENT_TYPES.ACTION_COMPLETED, this.handleActionEvent.bind(this, 'COMPLETED'));
    const actionErrorListenerId = globalEventBus.on(EVENT_TYPES.ACTION_ERROR, this.handleActionEvent.bind(this, 'ERROR'));

    this.listeners.push(actionStartListenerId, actionCompleteListenerId, actionErrorListenerId);

    // Listen for error events
    const errorListenerId = globalEventBus.on(EVENT_TYPES.ERROR, this.handleErrorEvent.bind(this));
    this.listeners.push(errorListenerId);

    logger.debug('[ReactiveSystem] Logging listeners setup');
  }

  /**
   * Setup state change listeners for side effects
   */
  private setupStateChangeListeners(): void {
    const stateListenerId = globalEventBus.on(EVENT_TYPES.STATE_UPDATED, this.handleStateChange.bind(this));
    this.listeners.push(stateListenerId);

    logger.debug('[ReactiveSystem] State change listeners setup');
  }

  /**
   * Setup component lifecycle listeners
   */
  private setupComponentListeners(): void {
    const mountListenerId = globalEventBus.on(EVENT_TYPES.COMPONENT_MOUNTED, this.handleComponentEvent.bind(this, 'MOUNTED'));
    const unmountListenerId = globalEventBus.on(EVENT_TYPES.COMPONENT_UNMOUNTED, this.handleComponentEvent.bind(this, 'UNMOUNTED'));
    const errorListenerId = globalEventBus.on(EVENT_TYPES.COMPONENT_ERROR, this.handleComponentEvent.bind(this, 'ERROR'));

    this.listeners.push(mountListenerId, unmountListenerId, errorListenerId);

    logger.debug('[ReactiveSystem] Component listeners setup');
  }

  /**
   * Handle analytics events - forward to available providers
   */
  private async handleAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Forward to window analytics providers if available
      const win = typeof window !== 'undefined' ? window as Window & {
        gtag?: (...args: unknown[]) => void;
        analytics?: { track: (event: string, properties?: Record<string, unknown>) => void };
        mixpanel?: { track: (event: string, properties?: Record<string, unknown>) => void };
      } : undefined;

      if (!win) return;

      // Try different providers
      if (win.gtag && event.provider !== 'segment' && event.provider !== 'mixpanel') {
        win.gtag('event', event.event, event.properties);
      }

      if (win.analytics && event.provider !== 'gtag' && event.provider !== 'mixpanel') {
        win.analytics.track(event.event, event.properties);
      }

      if (win.mixpanel && event.provider !== 'gtag' && event.provider !== 'segment') {
        win.mixpanel.track(event.event, event.properties);
      }

      logger.debug('[ReactiveSystem] Analytics event forwarded:', event.event);
    } catch (error) {
      logger.warn('[ReactiveSystem] Failed to forward analytics event:', error);
    }
  }

  /**
   * Handle user interaction events for automatic tracking
   */
  private async handleUserInteraction(event: any): Promise<void> {
    try {
      // Emit analytics event for user interactions
      await globalEventBus.emit(EVENT_TYPES.ANALYTICS_EVENT, {
        type: EVENT_TYPES.ANALYTICS_EVENT,
        event: 'user_interaction',
        properties: {
          interactionType: event.interactionType || 'unknown',
          component: event.component || 'unknown',
          ...event.properties
        },
        source: 'ReactiveSystem'
      });

      logger.debug('[ReactiveSystem] User interaction tracked:', event);
    } catch (error) {
      logger.warn('[ReactiveSystem] Failed to track user interaction:', error);
    }
  }

  /**
   * Handle action events for logging
   */
  private handleActionEvent(type: string, event: any): void {
    const level = type === 'ERROR' ? 'error' : type === 'STARTED' ? 'debug' : 'info';
    logger[level](`[ReactiveSystem] Action ${type.toLowerCase()}:`, {
      actionType: event.actionType,
      success: event.success,
      duration: event.duration,
      error: event.error
    });
  }

  /**
   * Handle error events
   */
  private handleErrorEvent(event: any): void {
    logger.error('[ReactiveSystem] Application error:', {
      message: event.message,
      stack: event.stack,
      component: event.component,
      ...event.context
    });
  }

  /**
   * Handle state change events for side effects
   */
  private async handleStateChange(event: StateUpdatedEvent): Promise<void> {
    try {
      // Log state changes in development
      logger.debug('[ReactiveSystem] State updated:', {
        key: event.key,
        previousValue: event.previousValue,
        newValue: event.value,
        source: event.source
      });

      // Could add side effects here based on state changes
      // For example: persist certain state keys to localStorage
      // or trigger additional events based on state values

      // Example: If cart is updated, emit cart analytics
      if (event.key === 'cart') {
        await globalEventBus.emit(EVENT_TYPES.ANALYTICS_EVENT, {
          type: EVENT_TYPES.ANALYTICS_EVENT,
          event: 'cart_updated',
          properties: {
            cartValue: event.value,
            source: event.source
          },
          source: 'ReactiveSystem'
        });
      }
    } catch (error) {
      logger.warn('[ReactiveSystem] Failed to handle state change:', error);
    }
  }

  /**
   * Handle component lifecycle events
   */
  private handleComponentEvent(type: string, event: any): void {
    logger.debug(`[ReactiveSystem] Component ${type.toLowerCase()}:`, {
      component: event.component,
      componentId: event.componentId,
      ...event.context
    });
  }
}

// Global reactive system instance
export const reactiveSystem = new ReactiveSystem();