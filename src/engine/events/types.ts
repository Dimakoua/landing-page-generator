import { EventHandler } from './EventBus';

/**
 * Event listener options
 */
export interface EventListenerOptions {
  once?: boolean;
  priority?: number;
}

/**
 * Event listener registration
 */
export interface EventListenerRegistration {
  id: string;
  event: string;
  handler: EventHandler;
  options?: EventListenerOptions;
}

/**
 * Event emission options
 */
export interface EventEmitOptions {
  timeout?: number;
  ignoreErrors?: boolean;
}

/**
 * Event bus statistics
 */
export interface EventBusStats {
  totalEvents: number;
  totalListeners: number;
  eventsWithListeners: string[];
  listenerCountByEvent: Record<string, number>;
}