import type { EventHandler } from './EventBus';

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

// ==================== Event type constants ====================

export const EVENT_TYPES = {
  // State management
  STATE_UPDATED: 'STATE_UPDATED',

  // Navigation
  NAVIGATE: 'NAVIGATE',
  REDIRECT: 'REDIRECT',

  // API
  API_SUCCESS: 'API_SUCCESS',
  API_ERROR: 'API_ERROR',

  // Analytics
  ANALYTICS_TRACK: 'ANALYTICS_TRACK',
  ANALYTICS_EVENT: 'ANALYTICS_EVENT',
  ANALYTICS_ERROR: 'ANALYTICS_ERROR',
  LOG_EVENT: 'LOG_EVENT',

  // User interactions
  USER_INTERACTION: 'USER_INTERACTION',
  FORM_SUBMIT: 'FORM_SUBMIT',
  FORM_VALIDATION_ERROR: 'FORM_VALIDATION_ERROR',

  // Popups
  POPUP_OPENED: 'POPUP_OPENED',
  POPUP_CLOSED: 'POPUP_CLOSED',

  // Actions
  ACTION_STARTED: 'ACTION_STARTED',
  ACTION_COMPLETED: 'ACTION_COMPLETED',
  ACTION_ERROR: 'ACTION_ERROR',

  // Cart
  CART_UPDATED: 'CART_UPDATED',
  CART_ITEM_ADDED: 'CART_ITEM_ADDED',
  CART_ITEM_REMOVED: 'CART_ITEM_REMOVED',
  CART_CLEARED: 'CART_CLEARED',

  // Components
  COMPONENT_MOUNTED: 'COMPONENT_MOUNTED',
  COMPONENT_UNMOUNTED: 'COMPONENT_UNMOUNTED',
  COMPONENT_ERROR: 'COMPONENT_ERROR',

  // Timing
  TIMER_STARTED: 'TIMER_STARTED',
  TIMER_COMPLETED: 'TIMER_COMPLETED',
  TIMER_CANCELLED: 'TIMER_CANCELLED',
  DELAY_COMPLETED: 'DELAY_COMPLETED',

  // Pixels and tracking
  PIXEL_FIRED: 'PIXEL_FIRED',
  PIXEL_ERROR: 'PIXEL_ERROR',
  IFRAME_LOADED: 'IFRAME_LOADED',
  IFRAME_ERROR: 'IFRAME_ERROR',
  CUSTOM_HTML_INJECTED: 'CUSTOM_HTML_INJECTED',
  HTML_RENDERED: 'HTML_RENDERED',
  HTML_REMOVED: 'HTML_REMOVED',
  HTML_ERROR: 'HTML_ERROR',

  // Chains and flows
  CHAIN_STARTED: 'CHAIN_STARTED',
  CHAIN_COMPLETED: 'CHAIN_COMPLETED',
  CHAIN_STEP_COMPLETED: 'CHAIN_STEP_COMPLETED',
  CHAIN_STOPPED: 'CHAIN_STOPPED',
  PARALLEL_STARTED: 'PARALLEL_STARTED',
  PARALLEL_COMPLETED: 'PARALLEL_COMPLETED',
  CONDITION_EVALUATED: 'CONDITION_EVALUATED',
  CONDITIONAL_EXECUTED: 'CONDITIONAL_EXECUTED',

  // Errors
  ERROR: 'ERROR',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];