import { z } from 'zod';

// ==================== Action Type Schemas ====================

// Navigate to another step in the funnel
export const NavigateActionSchema = z.object({
  type: z.literal('navigate'),
  url: z.string().describe('Step ID or relative path (e.g., /order)'),
  replace: z.boolean().optional().describe('Replace history instead of push'),
});

// Redirect to external URL
export const RedirectActionSchema = z.object({
  type: z.literal('redirect'),
  url: z.string().url().describe('Full external  URL'),
  target: z.enum(['_self', '_blank', '_parent', '_top']).default('_self'),
});

// HTTP Request Actions (using z.any() for recursive action references)
export const ApiActionSchema = z.object({
  type: z.enum(['post', 'get', 'put', 'patch', 'delete']),
  url: z.string().url().describe('API endpoint'),
  payload: z.record(z.string(), z.any()).optional().describe('Request body/params'),
  headers: z.record(z.string(), z.string()).optional(),
  timeout: z.number().default(10000).describe('Request timeout in ms'),
  retries: z.number().min(0).max(5).default(0).describe('Number of retry attempts'),
  onSuccess: z.any().optional().describe('Action to execute on success'),
  onError: z.any().optional().describe('Action to execute on error'),
});

// Analytics/Tracking
export const AnalyticsActionSchema = z.object({
  type: z.literal('analytics'),
  event: z.string().describe('Event name (e.g., "cta_clicked")'),
  properties: z.record(z.string(), z.any()).optional().describe('Event properties'),
  provider: z.enum(['gtag', 'segment', 'mixpanel', 'custom']).default('gtag'),
});

// Set form/funnel state
export const SetStateActionSchema = z.object({
  type: z.literal('setState'),
  key: z.string().describe('State key to update'),
  value: z.any().describe('Value to set'),
  merge: z.boolean().default(true).describe('Merge with existing or replace'),
});

// Execute multiple actions in sequence (using z.any() for recursive action references)
export const ChainActionSchema = z.object({
  type: z.literal('chain'),
  actions: z.array(z.any()).describe('Actions to execute in order'),
  stopOnError: z.boolean().default(true).describe('Stop chain if an action fails'),
});

// Execute multiple actions concurrently (using z.any() for recursive action references)
export const ParallelActionSchema = z.object({
  type: z.literal('parallel'),
  actions: z.array(z.any()).describe('Actions to execute simultaneously'),
  waitForAll: z.boolean().default(false).describe('Wait for all or just first completion'),
});

// Conditional execution (using z.any() for recursive action references)
export const ConditionalActionSchema = z.object({
  type: z.literal('conditional'),
  condition: z.enum(['stateEquals', 'stateExists', 'custom']).describe('Condition type'),
  key: z.string().optional().describe('State key to check'),
  value: z.any().optional().describe('Expected value for comparison'),
  ifTrue: z.any().describe('Action if condition passes'),
  ifFalse: z.any().optional().describe('Action if condition fails'),
});

// Delay execution (using z.any() for recursive action references)
export const DelayActionSchema = z.object({
  type: z.literal('delay'),
  duration: z.number().min(0).max(30000).describe('Delay in milliseconds'),
  then: z.any().optional().describe('Action to execute after delay'),
});

// Log/Debug
export const LogActionSchema = z.object({
  type: z.literal('log'),
  message: z.string(),
  level: z.enum(['info', 'warn', 'error', 'debug']).default('info'),
  data: z.any().optional(),
});

// Union of all action types
export const ActionSchema = z.discriminatedUnion('type', [
  NavigateActionSchema,
  RedirectActionSchema,
  ApiActionSchema,
  AnalyticsActionSchema,
  SetStateActionSchema,
  ChainActionSchema,
  ParallelActionSchema,
  ConditionalActionSchema,
  DelayActionSchema,
  LogActionSchema,
]);

// Properly typed Action union (TypeScript types with recursive references)
export type Action =
  | z.infer<typeof NavigateActionSchema>
  | z.infer<typeof RedirectActionSchema>
  | (z.infer<typeof ApiActionSchema> & { onSuccess?: Action; onError?: Action })
  | z.infer<typeof AnalyticsActionSchema>
  | z.infer<typeof SetStateActionSchema>
  | (z.infer<typeof ChainActionSchema> & { actions: Action[] })
  | (z.infer<typeof ParallelActionSchema> & {  actions: Action[] })
  | (z.infer<typeof ConditionalActionSchema> & { ifTrue: Action; ifFalse?: Action })
  | (z.infer<typeof DelayActionSchema> & { then?: Action })
  | z.infer<typeof LogActionSchema>;

// ==================== Action Context ====================

export interface ActionContext {
  // Funnel navigation
  navigate: (stepId: string, replace?: boolean) => void;

  // State management
  getState: (key: string) => unknown;
  setState: (key: string, value: unknown, merge?: boolean) => void;

  // Form data access
  formData: Record<string, unknown>;

  // Analytics integration
  trackEvent?: (event: string, properties?: Record<string, unknown>) => void;

  // Custom handlers
  customHandlers?: Record<string, (payload?: unknown) => Promise<unknown> | unknown>;
  
  // Flow configuration for conditional logic
  flow?: import('./index').Flow;
}

// ==================== Dispatch Result ====================

export interface DispatchResult {
  success: boolean;
  data?: unknown;
  error?: Error;
}