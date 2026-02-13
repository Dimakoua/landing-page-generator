type EventHandler<T = any> = (data: T) => void;

/**
 * Simple, type-safe Event Bus for reactive communication between engine components
 */
class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(event: string, handler: EventHandler<T>) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T = any>(event: string, data: T) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[EventBus] Error in handler for event "${event}":`, error);
        }
      });
    }
  }

  /**
   * Clear all listeners
   */
  clear() {
    this.listeners.clear();
  }
}

// Export a singleton instance
export const eventBus = new EventBus();

// Core event names
export enum EngineEvents {
  STATE_CHANGED = 'state_changed',
  STEP_NAVIGATE = 'step_navigate',
  ACTION_EXECUTED = 'action_executed',
  POPUP_CLOSED = 'popup_closed',
}
