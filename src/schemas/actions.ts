import { z } from 'zod';

// ==================== Action Type Schemas ====================

// Navigate to another step in the funnel
export const NavigateActionSchema = z.object({
  type: z.literal('navigate'),
  url: z.string().describe('Step ID or relative path (e.g., /order)'),
  replace: z.boolean().optional().describe('Replace history instead of push'),
});

// Close active popup
export const ClosePopupActionSchema = z.object({
  type: z.literal('closePopup'),
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
  url: z.union([z.string().url(), z.string().regex(/^\/.*/)]).describe('API endpoint (full URL or relative path)'),
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

// Fire tracking pixel
export const PixelActionSchema = z.object({
  type: z.literal('pixel'),
  url: z.string().url().describe('Pixel URL to fire'),
  params: z.record(z.string(), z.string()).optional().describe('Query parameters to append'),
  async: z.boolean().default(true).describe('Load pixel asynchronously'),
});

// Embed tracking iframe
export const IframeActionSchema = z.object({
  type: z.literal('iframe'),
  src: z.string().url().describe('Iframe source URL'),
  width: z.string().default('1').describe('Iframe width (CSS value)'),
  height: z.string().default('1').describe('Iframe height (CSS value)'),
  style: z.string().optional().describe('Additional CSS styles'),
  id: z.string().optional().describe('Iframe element ID'),
});

// Render custom HTML for tracking
export const CustomHtmlActionSchema = z.object({
  type: z.literal('customHtml'),
  html: z.string().describe('HTML code to render'),
  target: z.enum(['body', 'head']).default('body').describe('Where to inject the HTML'),
  position: z.enum(['append', 'prepend']).default('append').describe('Position relative to target'),
  id: z.string().optional().describe('Container element ID for the HTML'),
  removeAfter: z.number().optional().describe('Remove HTML after N milliseconds'),
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

// Plugin action for third-party/extension handlers
export const PluginActionSchema = z.object({
  type: z.literal('plugin'),
  name: z.string().describe('Plugin handler name (registered via runtime)'),
  payload: z.record(z.string(), z.any()).optional().describe('Arbitrary payload passed to the plugin handler'),
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

// Cart operations
export const CartActionSchema = z.object({
  type: z.literal('cart'),
  operation: z.enum(['add', 'remove', 'updateQuantity', 'update', 'clear']),
  itemId: z.string().optional(),
  quantity: z.number().optional(),
  item: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    image: z.string(),
    quantity: z.number().default(1),
    color: z.string().optional(),
  }).optional(),
});

// Union of all action types
export const ActionSchema = z.discriminatedUnion('type', [
  NavigateActionSchema,
  ClosePopupActionSchema,
  RedirectActionSchema,
  ApiActionSchema,
  AnalyticsActionSchema,
  PixelActionSchema,
  IframeActionSchema,
  CustomHtmlActionSchema,
  SetStateActionSchema,
  ChainActionSchema,
  ParallelActionSchema,
  ConditionalActionSchema,
  DelayActionSchema,
  LogActionSchema,
  CartActionSchema,
  PluginActionSchema,
]);

// Properly typed Action union (TypeScript types with recursive references)
export type Action =
  | z.infer<typeof NavigateActionSchema>
  | z.infer<typeof ClosePopupActionSchema>
  | z.infer<typeof RedirectActionSchema>
  | (z.infer<typeof ApiActionSchema> & { onSuccess?: Action; onError?: Action })
  | z.infer<typeof AnalyticsActionSchema>
  | z.infer<typeof PixelActionSchema>
  | z.infer<typeof IframeActionSchema>
  | z.infer<typeof CustomHtmlActionSchema>
  | z.infer<typeof SetStateActionSchema>
  | (z.infer<typeof ChainActionSchema> & { actions: Action[] })
  | (z.infer<typeof ParallelActionSchema> & {  actions: Action[] })
  | (z.infer<typeof ConditionalActionSchema> & { ifTrue: Action; ifFalse?: Action })
  | (z.infer<typeof DelayActionSchema> & { then?: Action })
  | z.infer<typeof LogActionSchema>
  | z.infer<typeof CartActionSchema>
  | z.infer<typeof PluginActionSchema>;

// ==================== Action Context ====================

export interface ActionContext {
  // Funnel navigation
  navigate: (stepId: string, replace?: boolean) => void;
  
  // Close active popup (if any)
  closePopup?: () => void;

  // State management
  getState: (key?: string) => unknown;
  setState: (key: string, value: unknown, merge?: boolean) => void;

  // Form data access
  formData: Record<string, unknown>;

  // A/B testing variant
  variant?: string;

  // Analytics integration
  trackEvent?: (event: string, properties?: Record<string, unknown>) => void;

  // Custom handlers
  customHandlers?: Record<string, (payload?: unknown) => Promise<unknown> | unknown>;

  // Security: opt-in flag to allow runtime HTML injection (customHtml)
  // Default: undefined/false (deny). Should be explicitly enabled per-landing when required.
  allowCustomHtml?: boolean;
}

// ==================== Dispatch Result ====================

export interface DispatchResult {
  success: boolean;
  data?: unknown;
  error?: Error;
}