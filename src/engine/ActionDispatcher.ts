import { z } from 'zod';
import { logger } from '../utils/logger';

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

// Execute multiple actions in sequence (using z.any() for recursive references)
export const ChainActionSchema = z.object({
  type: z.literal('chain'),
  actions: z.array(z.any()).describe('Actions to execute in order'),
  stopOnError: z.boolean().default(true).describe('Stop chain if an action fails'),
});

// Execute multiple actions concurrently (using z.any() for recursive references)
export const ParallelActionSchema = z.object({
  type: z.literal('parallel'),
  actions: z.array(z.any()).describe('Actions to execute simultaneously'),
  waitForAll: z.boolean().default(false).describe('Wait for all or just first completion'),
});

// Conditional execution (using z.any() for recursive references)
export const ConditionalActionSchema = z.object({
  type: z.literal('conditional'),
  condition: z.enum(['stateEquals', 'stateExists', 'custom']).describe('Condition type'),
  key: z.string().optional().describe('State key to check'),
  value: z.any().optional().describe('Expected value for comparison'),
  ifTrue: z.any().describe('Action if condition passes'),
  ifFalse: z.any().optional().describe('Action if condition fails'),
});

// Delay execution (using z.any() for recursive references)
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
}

// ==================== Action Dispatcher ====================

export interface DispatchResult {
  success: boolean;
  data?: unknown;
  error?: Error;
}

/**
 * Dispatches actions with comprehensive error handling and retry logic
 */
export class ActionDispatcher {
  private context: ActionContext;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(context: ActionContext) {
    this.context = context;
  }

  /**
   * Main dispatch method - validates and executes any action type
   */
  async dispatch(action: Action): Promise<DispatchResult> {
    try {
      // Validate action schema - safeParse for better type inference
      const result = ActionSchema.safeParse(action);
      
      if (!result.success) {
        logger.error('[ActionDispatcher] Validation failed', result.error);
        return {
          success: false,
          error: new Error(`Action validation failed: ${result.error.message}`),
        };
      }
      
      const validated = result.data as Action;
      
      logger.debug(`[ActionDispatcher] ${validated.type}`, validated);
      
      // Route to specific handler
      switch (validated.type) {
        case 'navigate':
          return await this.handleNavigate(validated);
        case 'redirect':
          return await this.handleRedirect(validated);
        case 'post':
        case 'get':
        case 'put':
        case 'patch':
        case 'delete':
          return await this.handleApi(validated);
        case 'analytics':
          return await this.handleAnalytics(validated);
        case 'setState':
          return await this.handleSetState(validated);
        case 'chain':
          return await this.handleChain(validated);
        case 'parallel':
          return await this.handleParallel(validated);
        case 'conditional':
          return await this.handleConditional(validated);
        case 'delay':
          return await this.handleDelay(validated);
        case 'log':
          return await this.handleLog(validated);
        default:
          throw new Error(`Unknown action type: ${(action as Action).type}`);
      }
    } catch (error) {
      logger.error('[ActionDispatcher] Dispatch failed', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private async handleNavigate(action: z.infer<typeof NavigateActionSchema>): Promise<DispatchResult> {
    try {
      this.context.navigate(action.url, action.replace);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private async handleRedirect(action: z.infer<typeof RedirectActionSchema>): Promise<DispatchResult> {
    try {
      if (action.target === '_blank') {
        window.open(action.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = action.url;
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private async handleApi(action: z.infer<typeof ApiActionSchema>): Promise<DispatchResult> {
    const executeRequest = async (attempt: number): Promise<DispatchResult> => {
      const abortController = new AbortController();
      const requestId = `${action.type}-${action.url}-${Date.now()}`;
      this.abortControllers.set(requestId, abortController);

      try {
        const timeoutId = setTimeout(() => abortController.abort(), action.timeout);

        const options: RequestInit = {
          method: action.type.toUpperCase(),
          headers: {
            'Content-Type': 'application/json',
            ...action.headers,
          },
          signal: abortController.signal,
        };

        // Add body for methods that support it
        if (['post', 'put', 'patch'].includes(action.type) && action.payload) {
          options.body = JSON.stringify(action.payload);
        }

        // Add query params for GET requests
        let url = action.url;
        if (action.type === 'get' && action.payload) {
          const params = new URLSearchParams(action.payload as Record<string, string>);
          url = `${url}?${params.toString()}`;
        }

        const response = await fetch(url, options);
        clearTimeout(timeoutId);
        this.abortControllers.delete(requestId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json().catch(() => null);

        // Execute success action if defined
        if (action.onSuccess) {
          await this.dispatch(action.onSuccess);
        }

        return { success: true, data };
      } catch (error) {
        this.abortControllers.delete(requestId);

        // Retry logic
        const maxRetries = action.retries ?? 0;
        if (attempt < maxRetries && error instanceof Error && error.name !== 'AbortError') {
          logger.warn(`[ActionDispatcher] API retry ${attempt + 1}/${maxRetries}`, action.url);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
          return executeRequest(attempt + 1);
        }

        // Execute error action if defined
        if (action.onError) {
          await this.dispatch(action.onError);
        }

        return { success: false, error: error as Error };
      }
    };

    return executeRequest(0);
  }

  private async handleAnalytics(action: z.infer<typeof AnalyticsActionSchema>): Promise<DispatchResult> {
    try {
      // Track via context if available
      if (this.context.trackEvent) {
        this.context.trackEvent(action.event, action.properties);
      }

      // Fallback to window integrations
      const win = typeof window !== 'undefined' ? window as Window & {
        gtag?: (...args: unknown[]) => void;
        analytics?: { track: (event: string, properties?: Record<string, unknown>) => void };
        mixpanel?: { track: (event: string, properties?: Record<string, unknown>) => void };
      } : undefined;

      if (!win) return { success: true };

      switch (action.provider) {
        case 'gtag':
          if (win.gtag) {
            win.gtag('event', action.event, action.properties);
          }
          break;
        case 'segment':
          if (win.analytics) {
            win.analytics.track(action.event, action.properties);
          }
          break;
        case 'mixpanel':
          if (win.mixpanel) {
            win.mixpanel.track(action.event, action.properties);
          }
          break;
      }

      logger.info(`[Analytics] ${action.event}`, action.properties);
      return { success: true };
    } catch (error) {
      // Analytics failures shouldn't break the user flow
      logger.warn('[Analytics] Failed:', error);
      return { success: true }; // Return success to continue flow
    }
  }

  private async handleSetState(action: z.infer<typeof SetStateActionSchema>): Promise<DispatchResult> {
    try {
      this.context.setState(action.key, action.value, action.merge);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private async handleChain(action: z.infer<typeof ChainActionSchema>): Promise<DispatchResult> {
    const results: DispatchResult[] = [];

    for (const childAction of action.actions) {
      const result = await this.dispatch(childAction);
      results.push(result);

      if (!result.success && action.stopOnError) {
        return {
          success: false,
          error: new Error(`Chain stopped at action ${results.length}: ${result.error?.message}`),
          data: results,
        };
      }
    }

    const allSuccess = results.every(r => r.success);
    return {
      success: allSuccess,
      data: results,
    };
  }

  private async handleParallel(action: z.infer<typeof ParallelActionSchema>): Promise<DispatchResult> {
    try {
      const promises = action.actions.map(a => this.dispatch(a));

      if (action.waitForAll) {
        const results = await Promise.all(promises);
        const allSuccess = results.every(r => r.success);
        return { success: allSuccess, data: results };
      } else {
        const result = await Promise.race(promises);
        return result;
      }
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private async handleConditional(action: z.infer<typeof ConditionalActionSchema>): Promise<DispatchResult> {
    try {
      let conditionMet = false;

      switch (action.condition) {
        case 'stateEquals':
          if (!action.key) throw new Error('key required for stateEquals condition');
          conditionMet = this.context.getState(action.key) === action.value;
          break;
        case 'stateExists':
          if (!action.key) throw new Error('key required for stateExists condition');
          conditionMet = this.context.getState(action.key) !== undefined;
          break;
        case 'custom':
          // Could be extended to support custom condition functions
          conditionMet = false;
          break;
      }

      const targetAction = conditionMet ? action.ifTrue : action.ifFalse;
      if (!targetAction) {
        return { success: true, data: { conditionMet, executed: false } };
      }

      return await this.dispatch(targetAction);
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private async handleDelay(action: z.infer<typeof DelayActionSchema>): Promise<DispatchResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, action.duration));
      
      if (action.then) {
        return await this.dispatch(action.then);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private async handleLog(action: z.infer<typeof LogActionSchema>): Promise<DispatchResult> {
    try {
      switch (action.level) {
        case 'info':
          logger.info(action.message, action.data);
          break;
        case 'warn':
          logger.warn(action.message, action.data);
          break;
        case 'error':
          logger.error(action.message, action.data);
          break;
        case 'debug':
          logger.debug(action.message, action.data);
          break;
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll() {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Helper: dispatch action by name from actions map
   */
  async dispatchNamed(actionName: string, actionsMap: Record<string, Action>): Promise<DispatchResult> {
    const action = actionsMap[actionName];
    if (!action) {
      logger.warn(`[ActionDispatcher] Action not found: ${actionName}`);
      return { success: false, error: new Error(`Action not found: ${actionName}`) };
    }
    return this.dispatch(action);
  }
}

/**
 * Factory function to create configured dispatcher
 */
export function createActionDispatcher(context: ActionContext): ActionDispatcher {
  return new ActionDispatcher(context);
}
