import { z } from 'zod';
import { EVENT_TYPES } from '../engine/events/types';

// ==================== Event Type Schemas ====================

// State management events
export const StateUpdatedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.STATE_UPDATED),
  key: z.string().describe('State key that was updated'),
  value: z.any().describe('New value'),
  previousValue: z.any().optional().describe('Previous value'),
  source: z.string().optional().describe('Source of the state change'),
});

// Navigation events
export const NavigateEventSchema = z.object({
  type: z.literal(EVENT_TYPES.NAVIGATE),
  url: z.string().describe('URL or step ID being navigated to'),
  replace: z.boolean().optional().describe('Whether to replace history'),
  source: z.string().optional().describe('Source component that triggered navigation'),
});

export const RedirectEventSchema = z.object({
  type: z.literal(EVENT_TYPES.REDIRECT),
  url: z.string().describe('External URL being redirected to'),
  target: z.string().optional().describe('Target window/frame'),
  source: z.string().optional().describe('Source that triggered redirect'),
});

// API events
export const ApiSuccessEventSchema = z.object({
  type: z.literal(EVENT_TYPES.API_SUCCESS),
  url: z.string().describe('API endpoint that succeeded'),
  method: z.string().describe('HTTP method used'),
  response: z.any().optional().describe('API response data'),
  duration: z.number().optional().describe('Request duration in ms'),
});

export const ApiErrorEventSchema = z.object({
  type: z.literal(EVENT_TYPES.API_ERROR),
  url: z.string().describe('API endpoint that failed'),
  method: z.string().describe('HTTP method used'),
  error: z.string().describe('Error message'),
  statusCode: z.number().optional().describe('HTTP status code'),
  duration: z.number().optional().describe('Request duration in ms'),
});

// Analytics events
export const AnalyticsTrackEventSchema = z.object({
  type: z.literal(EVENT_TYPES.ANALYTICS_TRACK),
  event: z.string().describe('Event name'),
  properties: z.record(z.string(), z.any()).optional().describe('Event properties'),
  provider: z.string().optional().describe('Analytics provider'),
  timestamp: z.number().optional().describe('Event timestamp'),
});

export const AnalyticsEventSchema = z.object({
  type: z.literal(EVENT_TYPES.ANALYTICS_EVENT),
  event: z.string().describe('Event name'),
  properties: z.record(z.string(), z.any()).optional().describe('Event properties'),
  provider: z.string().optional().describe('Analytics provider'),
});

export const AnalyticsErrorEventSchema = z.object({
  type: z.literal(EVENT_TYPES.ANALYTICS_ERROR),
  error: z.string().describe('Error message'),
  provider: z.string().optional().describe('Analytics provider'),
});

export const LogEventSchema = z.object({
  type: z.literal(EVENT_TYPES.LOG_EVENT),
  level: z.enum(['info', 'warn', 'error', 'debug']).describe('Log level'),
  message: z.string().describe('Log message'),
  data: z.any().optional().describe('Additional data'),
});

export const FormSubmitEventSchema = z.object({
  type: z.literal(EVENT_TYPES.FORM_SUBMIT),
  formId: z.string().describe('Form identifier'),
  data: z.record(z.string(), z.any()).describe('Form data'),
  component: z.string().optional().describe('Component that submitted the form'),
});

export const FormValidationErrorEventSchema = z.object({
  type: z.literal(EVENT_TYPES.FORM_VALIDATION_ERROR),
  formId: z.string().describe('Form identifier'),
  errors: z.record(z.string(), z.string()).describe('Validation errors by field'),
  component: z.string().optional().describe('Component with validation errors'),
});

// Popup events
export const PopupOpenedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.POPUP_OPENED),
  popupId: z.string().describe('Popup identifier'),
  source: z.string().optional().describe('Source that opened the popup'),
});

export const PopupClosedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.POPUP_CLOSED),
  popupId: z.string().describe('Popup identifier'),
  source: z.string().optional().describe('Source that closed the popup'),
});

// Action events
export const ActionStartedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.ACTION_STARTED),
  actionType: z.string().describe('Type of action that started'),
  actionId: z.string().optional().describe('Unique action identifier'),
  component: z.string().optional().describe('Component that triggered the action'),
});

export const ActionCompletedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.ACTION_COMPLETED),
  actionType: z.string().describe('Type of action that completed'),
  actionId: z.string().optional().describe('Unique action identifier'),
  result: z.any().optional().describe('Action result data'),
  duration: z.number().optional().describe('Action execution duration in ms'),
});

export const ActionErrorEventSchema = z.object({
  type: z.literal(EVENT_TYPES.ACTION_ERROR),
  actionType: z.string().describe('Type of action that failed'),
  actionId: z.string().optional().describe('Unique action identifier'),
  error: z.string().describe('Error message'),
  component: z.string().optional().describe('Component where error occurred'),
});

// Cart events
export const CartUpdatedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.CART_UPDATED),
  items: z.array(z.any()).describe('Current cart items'),
  total: z.number().optional().describe('Cart total'),
  source: z.string().optional().describe('Source of cart update'),
});

export const CartItemAddedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.CART_ITEM_ADDED),
  item: z.any().describe('Item that was added'),
  quantity: z.number().describe('Quantity added'),
  source: z.string().optional().describe('Source of addition'),
});

export const CartItemRemovedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.CART_ITEM_REMOVED),
  itemId: z.string().describe('ID of item that was removed'),
  quantity: z.number().describe('Quantity removed'),
  source: z.string().optional().describe('Source of removal'),
});

export const CartClearedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.CART_CLEARED),
  source: z.string().optional().describe('Source that cleared the cart'),
});

// Component events
export const ComponentMountedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.COMPONENT_MOUNTED),
  component: z.string().describe('Component name'),
  props: z.record(z.string(), z.any()).optional().describe('Component props'),
});

export const ComponentUnmountedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.COMPONENT_UNMOUNTED),
  component: z.string().describe('Component name'),
});

export const ComponentErrorEventSchema = z.object({
  type: z.literal(EVENT_TYPES.COMPONENT_ERROR),
  component: z.string().describe('Component name'),
  error: z.string().describe('Error message'),
  stack: z.string().optional().describe('Error stack trace'),
});

// Timer events
export const TimerStartedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.TIMER_STARTED),
  duration: z.number().describe('Timer duration in ms'),
  timerId: z.string().optional().describe('Timer identifier'),
});

export const TimerCompletedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.TIMER_COMPLETED),
  timerId: z.string().optional().describe('Timer identifier'),
});

export const TimerCancelledEventSchema = z.object({
  type: z.literal(EVENT_TYPES.TIMER_CANCELLED),
  timerId: z.string().optional().describe('Timer identifier'),
});

// Tracking events
export const PixelFiredEventSchema = z.object({
  type: z.literal(EVENT_TYPES.PIXEL_FIRED),
  url: z.string().describe('Pixel URL that was fired'),
  params: z.record(z.string(), z.string()).optional().describe('Query parameters'),
});

export const IframeLoadedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.IFRAME_LOADED),
  url: z.string().describe('Iframe URL that loaded'),
  iframeId: z.string().optional().describe('Iframe identifier'),
});

export const CustomHtmlInjectedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.CUSTOM_HTML_INJECTED),
  html: z.string().describe('HTML that was injected'),
  target: z.string().optional().describe('Injection target selector'),
});

// Flow control events
export const ChainStartedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.CHAIN_STARTED),
  chainId: z.string().optional().describe('Chain identifier'),
  actions: z.array(z.string()).describe('Action types in the chain'),
});

export const ChainCompletedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.CHAIN_COMPLETED),
  chainId: z.string().optional().describe('Chain identifier'),
  results: z.array(z.any()).optional().describe('Results from each action'),
});

export const ParallelStartedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.PARALLEL_STARTED),
  parallelId: z.string().optional().describe('Parallel execution identifier'),
  actions: z.array(z.string()).describe('Action types running in parallel'),
});

export const ParallelCompletedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.PARALLEL_COMPLETED),
  parallelId: z.string().optional().describe('Parallel execution identifier'),
  results: z.array(z.any()).optional().describe('Results from each action'),
});

export const ConditionalEvaluatedEventSchema = z.object({
  type: z.literal(EVENT_TYPES.CONDITION_EVALUATED),
  condition: z.string().describe('Condition that was evaluated'),
  result: z.boolean().describe('Evaluation result'),
  trueActions: z.array(z.string()).optional().describe('Actions taken when true'),
  falseActions: z.array(z.string()).optional().describe('Actions taken when false'),
});

// Error events
export const ErrorEventSchema = z.object({
  type: z.literal(EVENT_TYPES.ERROR),
  message: z.string().describe('Error message'),
  stack: z.string().optional().describe('Error stack trace'),
  component: z.string().optional().describe('Component where error occurred'),
  context: z.record(z.string(), z.any()).optional().describe('Additional error context'),
});

// User interaction events
export const UserInteractionEventSchema = z.object({
  type: z.literal(EVENT_TYPES.USER_INTERACTION),
  action: z.string().describe('Type of interaction (click, submit, etc.)'),
  component: z.string().describe('Component that triggered the interaction'),
  data: z.record(z.string(), z.any()).optional().describe('Additional interaction data'),
});

// ==================== Union of all event schemas ====================

export const EventSchema = z.discriminatedUnion('type', [
  StateUpdatedEventSchema,
  NavigateEventSchema,
  RedirectEventSchema,
  ApiSuccessEventSchema,
  ApiErrorEventSchema,
  AnalyticsTrackEventSchema,
  UserInteractionEventSchema,
  FormSubmitEventSchema,
  FormValidationErrorEventSchema,
  PopupOpenedEventSchema,
  PopupClosedEventSchema,
  ActionStartedEventSchema,
  ActionCompletedEventSchema,
  ActionErrorEventSchema,
  CartUpdatedEventSchema,
  CartItemAddedEventSchema,
  CartItemRemovedEventSchema,
  CartClearedEventSchema,
  ComponentMountedEventSchema,
  ComponentUnmountedEventSchema,
  ComponentErrorEventSchema,
  TimerStartedEventSchema,
  TimerCompletedEventSchema,
  TimerCancelledEventSchema,
  PixelFiredEventSchema,
  IframeLoadedEventSchema,
  CustomHtmlInjectedEventSchema,
  ChainStartedEventSchema,
  ChainCompletedEventSchema,
  ParallelStartedEventSchema,
  ParallelCompletedEventSchema,
  ConditionalEvaluatedEventSchema,
  ErrorEventSchema,
]);

// ==================== TypeScript types ====================

export type StateUpdatedEvent = z.infer<typeof StateUpdatedEventSchema>;
export type NavigateEvent = z.infer<typeof NavigateEventSchema>;
export type RedirectEvent = z.infer<typeof RedirectEventSchema>;
export type ApiSuccessEvent = z.infer<typeof ApiSuccessEventSchema>;
export type ApiErrorEvent = z.infer<typeof ApiErrorEventSchema>;
export type AnalyticsTrackEvent = z.infer<typeof AnalyticsTrackEventSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type AnalyticsErrorEvent = z.infer<typeof AnalyticsErrorEventSchema>;
export type LogEvent = z.infer<typeof LogEventSchema>;
export type UserInteractionEvent = z.infer<typeof UserInteractionEventSchema>;
export type FormSubmitEvent = z.infer<typeof FormSubmitEventSchema>;
export type FormValidationErrorEvent = z.infer<typeof FormValidationErrorEventSchema>;
export type PopupOpenedEvent = z.infer<typeof PopupOpenedEventSchema>;
export type PopupClosedEvent = z.infer<typeof PopupClosedEventSchema>;
export type ActionStartedEvent = z.infer<typeof ActionStartedEventSchema>;
export type ActionCompletedEvent = z.infer<typeof ActionCompletedEventSchema>;
export type ActionErrorEvent = z.infer<typeof ActionErrorEventSchema>;
export type CartUpdatedEvent = z.infer<typeof CartUpdatedEventSchema>;
export type CartItemAddedEvent = z.infer<typeof CartItemAddedEventSchema>;
export type CartItemRemovedEvent = z.infer<typeof CartItemRemovedEventSchema>;
export type CartClearedEvent = z.infer<typeof CartClearedEventSchema>;
export type ComponentMountedEvent = z.infer<typeof ComponentMountedEventSchema>;
export type ComponentUnmountedEvent = z.infer<typeof ComponentUnmountedEventSchema>;
export type ComponentErrorEvent = z.infer<typeof ComponentErrorEventSchema>;
export type TimerStartedEvent = z.infer<typeof TimerStartedEventSchema>;
export type TimerCompletedEvent = z.infer<typeof TimerCompletedEventSchema>;
export type TimerCancelledEvent = z.infer<typeof TimerCancelledEventSchema>;
export type PixelFiredEvent = z.infer<typeof PixelFiredEventSchema>;
export type IframeLoadedEvent = z.infer<typeof IframeLoadedEventSchema>;
export type CustomHtmlInjectedEvent = z.infer<typeof CustomHtmlInjectedEventSchema>;
export type ChainStartedEvent = z.infer<typeof ChainStartedEventSchema>;
export type ChainCompletedEvent = z.infer<typeof ChainCompletedEventSchema>;
export type ParallelStartedEvent = z.infer<typeof ParallelStartedEventSchema>;
export type ParallelCompletedEvent = z.infer<typeof ParallelCompletedEventSchema>;
export type ConditionalEvaluatedEvent = z.infer<typeof ConditionalEvaluatedEventSchema>;
export type ErrorEvent = z.infer<typeof ErrorEventSchema>;

export type Event = z.infer<typeof EventSchema>;