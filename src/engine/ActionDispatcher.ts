import { logger } from '../utils/logger';
import {
  ActionSchema
} from '../schemas/actions';
import type {
  Action,
  ActionContext,
  DispatchResult
} from '../schemas/actions';

// Re-export types for backward compatibility
export type { Action, ActionContext, DispatchResult };
import { getActionHandler } from './actions/ActionRegistry';

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
   * Uses ACTION_REGISTRY for dynamic handler lookup (instead of switch statement)
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
      
      // Look up handler from registry (replaces 25-line switch statement)
      const handler = getActionHandler(validated.type);
      if (!handler) {
        throw new Error(`Unknown action type: ${validated.type}`);
      }

      // Handle special case for API actions that need abort controllers
      if (['post', 'get', 'put', 'patch', 'delete'].includes(validated.type)) {
        // Pass abort controllers for API actions
        return await (handler as any)(validated, this.context, this.dispatch.bind(this), this.abortControllers);
      }

      return await handler(validated, this.context, this.dispatch.bind(this));
    } catch (error) {
      logger.error('[ActionDispatcher] Dispatch failed', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
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

  /**
   * Get state value by key or entire state
   */
  getState(key?: string): unknown {
    return this.context.getState(key);
  }
}

/**
 * Factory function to create configured dispatcher
 */
export function createActionDispatcher(context: ActionContext): ActionDispatcher {
  return new ActionDispatcher(context);
}
