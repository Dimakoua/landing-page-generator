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
import { handleNavigate } from './actions/NavigateAction';
import { handleRedirect } from './actions/RedirectAction';
import { handleApi } from './actions/ApiAction';
import { handleAnalytics } from './actions/AnalyticsAction';
import { handleSetState } from './actions/SetStateAction';
import { handleChain } from './actions/ChainAction';
import { handleParallel } from './actions/ParallelAction';
import { handleConditional } from './actions/ConditionalAction';
import { handleDelay } from './actions/DelayAction';
import { handleLog } from './actions/LogAction';

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
          return await handleNavigate(validated, this.context);
        case 'redirect':
          return await handleRedirect(validated);
        case 'post':
        case 'get':
        case 'put':
        case 'patch':
        case 'delete':
          return await handleApi(validated, this.dispatch.bind(this), this.abortControllers);
        case 'analytics':
          return await handleAnalytics(validated, this.context);
        case 'setState':
          return await handleSetState(validated, this.context);
        case 'chain':
          return await handleChain(validated, this.dispatch.bind(this));
        case 'parallel':
          return await handleParallel(validated, this.dispatch.bind(this));
        case 'conditional':
          return await handleConditional(validated, this.context, this.dispatch.bind(this));
        case 'delay':
          return await handleDelay(validated, this.dispatch.bind(this));
        case 'log':
          return await handleLog(validated);
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
