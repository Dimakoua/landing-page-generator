import { logger } from '../../utils/logger';
import type {
  StateUpdatedEvent,
  NavigateEvent,
  RedirectEvent,
  ApiSuccessEvent,
  ApiErrorEvent,
  AnalyticsTrackEvent,
  AnalyticsEvent,
  AnalyticsErrorEvent,
  LogEvent,
  UserInteractionEvent,
  FormSubmitEvent,
  FormValidationErrorEvent,
  PopupOpenedEvent,
  PopupClosedEvent,
  ActionStartedEvent,
  ActionCompletedEvent,
  ActionErrorEvent,
  CartUpdatedEvent,
  CartItemAddedEvent,
  CartItemRemovedEvent,
  CartClearedEvent,
  ComponentMountedEvent,
  ComponentUnmountedEvent,
  ComponentErrorEvent,
  TimerStartedEvent,
  TimerCompletedEvent,
  TimerCancelledEvent,
  PixelFiredEvent,
  IframeLoadedEvent,
  CustomHtmlInjectedEvent,
  ChainStartedEvent,
  ChainCompletedEvent,
  ParallelStartedEvent,
  ParallelCompletedEvent,
  ConditionalEvaluatedEvent,
  ErrorEvent,
} from '../../schemas/events';

/**
 * Typed event registry: strict mapping of event type → payload shape
 * Ensures compile-time safety: TypeScript catches mismatches between emit() and on()
 */
export interface TypedEventRegistry {
  STATE_UPDATED: StateUpdatedEvent;
  NAVIGATE: NavigateEvent;
  REDIRECT: RedirectEvent;
  API_SUCCESS: ApiSuccessEvent;
  API_ERROR: ApiErrorEvent;
  ANALYTICS_TRACK: AnalyticsTrackEvent;
  ANALYTICS_EVENT: AnalyticsEvent;
  ANALYTICS_ERROR: AnalyticsErrorEvent;
  LOG_EVENT: LogEvent;
  USER_INTERACTION: UserInteractionEvent;
  FORM_SUBMIT: FormSubmitEvent;
  FORM_VALIDATION_ERROR: FormValidationErrorEvent;
  POPUP_OPENED: PopupOpenedEvent;
  POPUP_CLOSED: PopupClosedEvent;
  ACTION_STARTED: ActionStartedEvent;
  ACTION_COMPLETED: ActionCompletedEvent;
  ACTION_ERROR: ActionErrorEvent;
  CART_UPDATED: CartUpdatedEvent;
  CART_ITEM_ADDED: CartItemAddedEvent;
  CART_ITEM_REMOVED: CartItemRemovedEvent;
  CART_CLEARED: CartClearedEvent;
  COMPONENT_MOUNTED: ComponentMountedEvent;
  COMPONENT_UNMOUNTED: ComponentUnmountedEvent;
  COMPONENT_ERROR: ComponentErrorEvent;
  TIMER_STARTED: TimerStartedEvent;
  TIMER_COMPLETED: TimerCompletedEvent;
  TIMER_CANCELLED: TimerCancelledEvent;
  PIXEL_FIRED: PixelFiredEvent;
  IFRAME_LOADED: IframeLoadedEvent;
  CUSTOM_HTML_INJECTED: CustomHtmlInjectedEvent;
  CHAIN_STARTED: ChainStartedEvent;
  CHAIN_COMPLETED: ChainCompletedEvent;
  PARALLEL_STARTED: ParallelStartedEvent;
  PARALLEL_COMPLETED: ParallelCompletedEvent;
  CONDITION_EVALUATED: ConditionalEvaluatedEvent;
  ERROR: ErrorEvent;
}

/**
 * Typed event handler: guaranteed to receive correct payload type
 */
export type TypedEventHandler<T extends keyof TypedEventRegistry> = (
  payload: TypedEventRegistry[T]
) => void | Promise<void>;

/**
 * Event listener entry with metadata
 */
interface EventListener<T extends keyof TypedEventRegistry> {
  handler: TypedEventHandler<T>;
  once: boolean;
  id: string;
}

/**
 * TypedEventBus: Strongly-typed pub/sub with payload guarantees
 *
 * Usage:
 * ```typescript
 * // Subscribe to a typed event
 * typedEventBus.on('STATE_UPDATED', (event) => {
 *   // ✅ event.key exists and is typed as string
 *   // ✅ event.value exists and is typed as unknown
 *   // ✅ IDE provides autocomplete
 *   console.log(event.key, event.value);
 * });
 *
 * // Emit an event
 * typedEventBus.emit('STATE_UPDATED', {
 *   type: 'STATE_UPDATED',
 *   key: 'myKey',
 *   value: 42,
 * });
 * ```
 */
export class TypedEventBus {
  private listeners = new Map<keyof TypedEventRegistry, EventListener<any>[]>();
  private nextId = 0;

  /**
   * Subscribe to a typed event
   * Handler automatically receives the correct payload type
   *
   * @param event Event name from TypedEventRegistry
   * @param handler Function called when event is emitted
   * @param once Whether to remove listener after first emission
   * @returns Listener ID for cleanup with off()
   */
  on<T extends keyof TypedEventRegistry>(
    event: T,
    handler: TypedEventHandler<T>,
    once = false
  ): string {
    const id = `typed_listener_${this.nextId++}`;

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push({
      handler,
      once,
      id,
    });

    return id;
  }

  /**
   * Subscribe to a one-time event emission
   *
   * @param event Event name from TypedEventRegistry
   * @param handler Function called when event is emitted (once)
   * @returns Listener ID for cleanup
   */
  once<T extends keyof TypedEventRegistry>(
    event: T,
    handler: TypedEventHandler<T>
  ): string {
    return this.on(event, handler, true);
  }

  /**
   * Remove an event listener by ID
   *
   * @param event Event name
   * @param listenerId Listener ID returned by on() or once()
   */
  off<T extends keyof TypedEventRegistry>(event: T, listenerId: string): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    const index = eventListeners.findIndex(listener => listener.id === listenerId);
    if (index !== -1) {
      eventListeners.splice(index, 1);
      if (eventListeners.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Remove all listeners for an event
   *
   * @param event Event name (optional - if not provided, removes all listeners)
   */
  removeAllListeners<T extends keyof TypedEventRegistry>(event?: T): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emit a typed event asynchronously
   * TypeScript ensures payload matches the registered event type
   *
   * @param event Event name from TypedEventRegistry
   * @param payload Data to pass to listeners (must match event type)
   */
  async emit<T extends keyof TypedEventRegistry>(
    event: T,
    payload: TypedEventRegistry[T]
  ): Promise<void> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.length === 0) {
      return;
    }

    // Create a copy to handle removals during iteration
    const listenersToCall = [...eventListeners];

    // Process listeners asynchronously
    const promises = listenersToCall.map(async (listener) => {
      try {
        await listener.handler(payload);
      } catch (error) {
        logger.error(`TypedEventBus: Error in listener for event '${String(event)}':`, error);
      }
    });

    // Wait for all listeners to complete
    await Promise.allSettled(promises);

    // Remove one-time listeners
    const remainingListeners = eventListeners.filter(listener => {
      const wasCalled = listenersToCall.includes(listener);
      return !(wasCalled && listener.once);
    });

    if (remainingListeners.length === 0) {
      this.listeners.delete(event);
    } else {
      this.listeners.set(event, remainingListeners);
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount<T extends keyof TypedEventRegistry>(event: T): number {
    return this.listeners.get(event)?.length ?? 0;
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): (keyof TypedEventRegistry)[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if an event has any listeners
   */
  hasListeners<T extends keyof TypedEventRegistry>(event: T): boolean {
    return this.listenerCount(event) > 0;
  }

  /**
   * Get stats about current listeners
   */
  getStats() {
    return {
      totalEventTypes: this.listeners.size,
      totalListeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
      eventNames: Array.from(this.listeners.keys()),
      listenerCountByEvent: Object.fromEntries(
        Array.from(this.listeners.entries()).map(([event, listeners]) => [event, listeners.length])
      ),
    };
  }
}

/**
 * Global typed event bus instance
 * Use this for all event communication in the application
 */
export const typedEventBus = new TypedEventBus();
