import { logger } from "../utils/logger";
import type { Action, ActionContext, DispatchResult } from "../schemas/actions";
import { getActionHandler } from './actionHandlerRegistry';

// Re-export types for backward compatibility
export type { Action, ActionContext, DispatchResult };

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
      // Validate action schema - load validator dynamically to keep zod out of the main bundle
      const { ActionSchema } = await import('../schemas/actions');
      const result = ActionSchema.safeParse(action);

      if (!result.success) {
        logger.error("[ActionDispatcher] Validation failed", result.error);
        return {
          success: false,
          error: new Error(`Action validation failed: ${result.error.message}`),
        };
      }

      const validated = result.data as Action;

      logger.debug(`[ActionDispatcher] ${validated.type}`, validated);

      // Lookup handler from the centralized registry (supports plugin registration)
      let handler;

      if (validated.type === 'plugin') {
        // plugin actions must specify a registered handler name
        const pluginName = (validated as any).name;
        handler = getActionHandler(`plugin:${pluginName}`);
      } else {
        handler = getActionHandler(validated.type as string);
      }

      if (!handler) {
        throw new Error(`No handler registered for action type: ${validated.type}`);
      }

      // Security: enforce policy for runtime HTML injection here (registry keeps behavior minimal)
      if ((validated.type === 'customHtml') && !this.context.allowCustomHtml) {
        logger.warn('[ActionDispatcher] customHtml action blocked by policy');
        return { success: false, error: new Error('customHtml action blocked by policy') };
      }

      return await handler(validated, this.context, this.dispatch.bind(this), this.abortControllers);
    } catch (error) {
      logger.error("[ActionDispatcher] Dispatch failed", error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Updates the context for the dispatcher without creating a new instance
   */
  updateContext(context: ActionContext) {
    this.context = context;
  }

  /**
   * Cancel all pending requests
   */
  cancelAll() {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Helper: dispatch action by name from actions map
   */
  async dispatchNamed(
    actionName: string,
    actionsMap: Record<string, Action>,
  ): Promise<DispatchResult> {
    const action = actionsMap[actionName];
    if (!action) {
      logger.warn(`[ActionDispatcher] Action not found: ${actionName}`);
      return {
        success: false,
        error: new Error(`Action not found: ${actionName}`),
      };
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
export function createActionDispatcher(
  context: ActionContext,
): ActionDispatcher {
  return new ActionDispatcher(context);
}
