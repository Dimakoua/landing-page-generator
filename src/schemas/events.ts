import { z } from 'zod';

// ==================== Event Type Schemas ====================

// State management events
export const StateUpdatedEventSchema = z.object({
  type: z.literal('STATE_UPDATED'),
  key: z.string().describe('State key that was updated'),
  value: z.any().describe('New value'),
  previousValue: z.any().optional().describe('Previous value'),
  source: z.string().optional().describe('Source of the state change'),
});

// Navigation events
export const NavigateEventSchema = z.object({
  type: z.literal('NAVIGATE'),
  url: z.string().describe('URL or step ID being navigated to'),
  replace: z.boolean().optional().describe('Whether to replace history'),
  source: z.string().optional().describe('Source component that triggered navigation'),
});

// API events
export const ApiSuccessEventSchema = z.object({
  type: z.literal('API_SUCCESS'),
  url: z.string().describe('API endpoint that succeeded'),
  method: z.string().describe('HTTP method used'),
  response: z.any().optional().describe('API response data'),
  duration: z.number().optional().describe('Request duration in ms'),
});

export const ApiErrorEventSchema = z.object({
  type: z.literal('API_ERROR'),
  url: z.string().describe('API endpoint that failed'),
  method: z.string().describe('HTTP method used'),
  error: z.string().describe('Error message'),
  statusCode: z.number().optional().describe('HTTP status code'),
  duration: z.number().optional().describe('Request duration in ms'),
});

// Analytics events
export const AnalyticsTrackEventSchema = z.object({
  type: z.literal('ANALYTICS_TRACK'),
  event: z.string().describe('Event name'),
  properties: z.record(z.string(), z.any()).optional().describe('Event properties'),
  provider: z.string().optional().describe('Analytics provider'),
  timestamp: z.number().optional().describe('Event timestamp'),
});

// User interaction events
export const UserInteractionEventSchema = z.object({
  type: z.literal('USER_INTERACTION'),
  action: z.string().describe('Type of interaction (click, submit, etc.)'),
  component: z.string().describe('Component that triggered the interaction'),
  data: z.record(z.string(), z.any()).optional().describe('Additional interaction data'),
});

// Error events
export const ErrorEventSchema = z.object({
  type: z.literal('ERROR'),
  message: z.string().describe('Error message'),
  stack: z.string().optional().describe('Error stack trace'),
  component: z.string().optional().describe('Component where error occurred'),
  context: z.record(z.string(), z.any()).optional().describe('Additional error context'),
});

// ==================== Union of all event schemas ====================

export const EventSchema = z.discriminatedUnion('type', [
  StateUpdatedEventSchema,
  NavigateEventSchema,
  ApiSuccessEventSchema,
  ApiErrorEventSchema,
  AnalyticsTrackEventSchema,
  UserInteractionEventSchema,
  ErrorEventSchema,
]);

// ==================== TypeScript types ====================

export type StateUpdatedEvent = z.infer<typeof StateUpdatedEventSchema>;
export type NavigateEvent = z.infer<typeof NavigateEventSchema>;
export type ApiSuccessEvent = z.infer<typeof ApiSuccessEventSchema>;
export type ApiErrorEvent = z.infer<typeof ApiErrorEventSchema>;
export type AnalyticsTrackEvent = z.infer<typeof AnalyticsTrackEventSchema>;
export type UserInteractionEvent = z.infer<typeof UserInteractionEventSchema>;
export type ErrorEvent = z.infer<typeof ErrorEventSchema>;

export type Event = z.infer<typeof EventSchema>;

// ==================== Event type constants ====================

export const EVENT_TYPES = {
  STATE_UPDATED: 'STATE_UPDATED',
  NAVIGATE: 'NAVIGATE',
  API_SUCCESS: 'API_SUCCESS',
  API_ERROR: 'API_ERROR',
  ANALYTICS_TRACK: 'ANALYTICS_TRACK',
  USER_INTERACTION: 'USER_INTERACTION',
  ERROR: 'ERROR',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];