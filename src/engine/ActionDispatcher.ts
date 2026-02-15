import { logger } from "../utils/logger";
import type { Action, ActionContext, DispatchResult, PluginAction } from '../schemas/actions';
import { getActionHandler } from './actionHandlerRegistry';

// Re-export types for backward compatibility
export type { Action, ActionContext, DispatchResult };

/**
 * Action validation schemas defining required fields and defaults
 */
const ACTION_SCHEMAS: Record<string, { req: string[], def?: Record<string, unknown> }> = {
  navigate: { req: ['url'] },
  redirect: { req: ['url'], def: { target: '_self' } },
  analytics: { req: ['event'], def: { provider: 'gtag' } },
  pixel: { req: ['url'], def: { async: true } },
  iframe: { req: ['src'], def: { width: '1', height: '1' } },
  customHtml: { req: ['html'], def: { target: 'body', position: 'append' } },
  setState: { req: ['key'], def: { merge: true } },
  log: { req: ['message'], def: { level: 'info' } },
  chain: { req: ['actions'] },
  parallel: { req: ['actions'] },
  conditional: { req: ['condition'] },
  delay: { req: ['duration'] },
  cart: { req: ['operation'] },
  plugin: { req: ['name'] }
};

// Apply API defaults to all method variants
['get', 'post', 'put', 'patch', 'delete'].forEach(type => {
  ACTION_SCHEMAS[type] = { req: ['url'], def: { timeout: 10000, retries: 0 } };
});

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
   * Main dispatch method - executes any action type
   */
  async dispatch(action: Action): Promise<DispatchResult> {
    try {
      // Validate and enrich action with defaults
      const enrichedAction = this.prepareAction(action);
      logger.debug(`[ActionDispatcher] ${enrichedAction.type}`, enrichedAction);

      // Lookup handler from the centralized registry (supports plugin registration)
      let handler;

      if (enrichedAction.type === 'plugin') {
        // plugin actions must specify a registered handler name
        const pluginName = (enrichedAction as PluginAction).name;
        handler = await getActionHandler(`plugin:${pluginName}`);
      } else {
        handler = await getActionHandler(enrichedAction.type as string);
      }

      if (!handler) {
        throw new Error(`Action validation failed: No handler registered for action type: ${enrichedAction.type}`);
      }

      // Security: enforce policy for runtime HTML injection here (registry keeps behavior minimal)
      if ((enrichedAction.type === 'customHtml') && !this.context.allowCustomHtml) {
        logger.warn('[ActionDispatcher] customHtml action blocked by policy');
        return { success: false, error: new Error('customHtml action blocked by policy') };
      }

      return await handler(enrichedAction, this.context, this.dispatch.bind(this), this.abortControllers);
    } catch (error) {
      logger.error("[ActionDispatcher] Dispatch failed", error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Prepares an action by validating required fields and applying defaults
   */
  private prepareAction(action: Action): Action {
    const type = action?.type;
    if (!type) throw new Error('Action validation failed: Missing action type');

    const enriched = { ...action } as Record<string, unknown>;
    const schema = ACTION_SCHEMAS[type];

    if (schema) {
      schema.req.forEach(f => {
        if (enriched[f] === undefined || enriched[f] === null) {
          throw new Error(`Action validation failed: ${type} requires ${f}`);
        }
      });
      Object.entries(schema.def || {}).forEach(([k, v]) => {
        if (enriched[k] === undefined) enriched[k] = v;
      });
    }

    // Specific runtime type validations
    if ((type === 'chain' || type === 'parallel') && !Array.isArray(enriched.actions)) {
      throw new Error(`Action validation failed: ${type} requires actions array`);
    }
    if (type === 'delay' && typeof enriched.duration !== 'number') {
      throw new Error('Action validation failed: delay requires duration number');
    }

    return enriched as unknown as Action;
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
