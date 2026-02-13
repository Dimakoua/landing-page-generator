import { logger } from "../utils/logger";
import { ActionSchema } from "../schemas/actions";
import type { Action, ActionContext, DispatchResult } from "../schemas/actions";

// Re-export types for backward compatibility
export type { Action, ActionContext, DispatchResult };
import { handleNavigate } from "./actions/NavigateAction";
import { handleClosePopup } from "./actions/ClosePopupAction";
import { handleRedirect } from "./actions/RedirectAction";
import { handleApi } from "./actions/ApiAction";
import { handleAnalytics } from "./actions/AnalyticsAction";
import { handlePixel } from "./actions/PixelAction";
import { handleIframe } from "./actions/IframeAction";
import { handleCustomHtml } from "./actions/CustomHtmlAction";
import { handleSetState } from "./actions/SetStateAction";
import { handleChain } from "./actions/ChainAction";
import { handleParallel } from "./actions/ParallelAction";
import { handleConditional } from "./actions/ConditionalAction";
import { handleDelay } from "./actions/DelayAction";
import { handleLog } from "./actions/LogAction";
import { handleCart } from "./actions/CartAction";
// Handler registry (built-in handlers are registered at module init)
import { registerActionHandler, getActionHandler } from './actionHandlerRegistry';
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
