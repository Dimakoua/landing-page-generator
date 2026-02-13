import { logger } from '../../utils/logger';

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (payload: T) => void | Promise<void>;

/**
 * Event listener entry with metadata
 */
interface EventListener<T = any> {
  handler: EventHandler<T>;
  once: boolean;
  id: string;
}

/**
 * Event Bus for reactive communication between components
 * Provides pub/sub functionality with async event handling and proper cleanup
 */
export class EventBus {
  private listeners = new Map<string, EventListener[]>();
  private nextId = 0;

  /**
   * Register an event listener
   * @param event - Event name to listen for
   * @param handler - Function to call when event is emitted
   * @param once - Whether to remove listener after first emission
   * @returns Listener ID for cleanup
   */
  on<T = any>(event: string, handler: EventHandler<T>, once = false): string {
    const id = `listener_${this.nextId++}`;

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
   * Register a one-time event listener
   * @param event - Event name to listen for
   * @param handler - Function to call when event is emitted (once)
   * @returns Listener ID for cleanup
   */
  once<T = any>(event: string, handler: EventHandler<T>): string {
    return this.on(event, handler, true);
  }

  /**
   * Remove an event listener by ID
   * @param event - Event name
   * @param listenerId - Listener ID returned by on() or once()
   */
  off(event: string, listenerId: string): void {
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
   * @param event - Event name (optional - if not provided, removes all listeners)
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emit an event asynchronously to prevent blocking
   * @param event - Event name to emit
   * @param payload - Data to pass to listeners
   */
  async emit<T = any>(event: string, payload?: T): Promise<void> {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.length === 0) {
      return;
    }

    // Create a copy of listeners to avoid issues if listeners are removed during emission
    const listenersToCall = [...eventListeners];

    // Process listeners asynchronously to prevent blocking
    const promises = listenersToCall.map(async (listener) => {
      try {
        await listener.handler(payload);
      } catch (error) {
        logger.error(`EventBus: Error in listener for event '${event}':`, error);
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
   * @param event - Event name
   * @returns Number of listeners
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0;
  }

  /**
   * Get all event names that have listeners
   * @returns Array of event names
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if an event has any listeners
   * @param event - Event name
   * @returns True if event has listeners
   */
  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }
}

// Re-export event type constants for convenience
export { EVENT_TYPES } from './types';

// Global event bus instance for app-wide events
export const globalEventBus = new EventBus();