import type { 
  Action, 
  DispatchResult, 
  ActionContext,
  NavigateAction,
  ClosePopupAction,
  RedirectAction,
  ApiAction,
  AnalyticsAction,
  PixelAction,
  IframeAction,
  CustomHtmlAction,
  SetStateAction,
  ChainAction,
  ParallelAction,
  ConditionalAction,
  DelayAction,
  LogAction,
  CartAction
} from '@/schemas/actions';

export type ActionHandler = (
  action: Action,
  context: ActionContext,
  dispatch: (action: Action) => Promise<DispatchResult>,
  abortControllers?: Map<string, AbortController>
) => Promise<DispatchResult>;

const handlers: Map<string, ActionHandler> = new Map();

/**
 * Register a new action handler
 */
export function registerActionHandler(type: string, handler: ActionHandler) {
  handlers.set(type, handler);
}

/**
 * List all currently registered action types
 */
export function listRegisteredHandlers(): string[] {
  return Array.from(handlers.keys()).concat(Array.from(loadedHandlers.keys()));
}

/**
 * Clear all registered handlers (mainly for testing)
 */
export function clearRegisteredHandlers() {
  handlers.clear();
}

// --- Built-in Handler Registration -------------------------------------------
// These are standard handlers that come with the engine by default.
// Using lazy imports for these to reduce initial bundle size.

/**
 * Creates a lazy loader for an action handler
 */
function createLazyHandler(
  modulePath: string,
  handlerFactory: (module: any) => ActionHandler
): () => Promise<ActionHandler> {
  return async () => {
    const module = await import(/* @vite-ignore */ modulePath);
    return handlerFactory(module);
  };
}

const lazyHandlers: Record<string, () => Promise<ActionHandler>> = {
  // Navigation actions
  navigate: createLazyHandler('./actions/NavigateAction', 
    ({ handleNavigate }) => (action, context) => handleNavigate(action as NavigateAction, context)),
  closePopup: createLazyHandler('./actions/ClosePopupAction',
    ({ handleClosePopup }) => (action, context) => handleClosePopup(action as ClosePopupAction, context)),
  redirect: createLazyHandler('./actions/RedirectAction',
    ({ handleRedirect }) => (action) => handleRedirect(action as RedirectAction)),

  // Analytics & tracking
  analytics: createLazyHandler('./actions/AnalyticsAction',
    ({ handleAnalytics }) => (action, context) => handleAnalytics(action as AnalyticsAction, context)),
  pixel: createLazyHandler('./actions/PixelAction',
    ({ handlePixel }) => (action) => handlePixel(action as PixelAction)),

  // Content & DOM manipulation
  iframe: createLazyHandler('./actions/IframeAction',
    ({ handleIframe }) => (action) => handleIframe(action as IframeAction)),
  customHtml: createLazyHandler('./actions/CustomHtmlAction',
    ({ handleCustomHtml }) => (action) => handleCustomHtml(action as CustomHtmlAction)),

  // State management
  setState: createLazyHandler('./actions/SetStateAction',
    ({ handleSetState }) => (action, context) => handleSetState(action as SetStateAction, context)),

  // Control flow
  chain: createLazyHandler('./actions/ChainAction',
    ({ handleChain }) => (action, _context, dispatch) => handleChain(action as ChainAction, dispatch)),
  parallel: createLazyHandler('./actions/ParallelAction',
    ({ handleParallel }) => (action, _context, dispatch) => handleParallel(action as ParallelAction, dispatch)),
  conditional: createLazyHandler('./actions/ConditionalAction',
    ({ handleConditional }) => (action, context, dispatch) => handleConditional(action as ConditionalAction, context, dispatch)),
  delay: createLazyHandler('./actions/DelayAction',
    ({ handleDelay }) => (action, _context, dispatch) => handleDelay(action as DelayAction, dispatch)),

  // Utility
  log: createLazyHandler('./actions/LogAction',
    ({ handleLog }) => (action) => handleLog(action as LogAction)),

  // Business logic
  cart: createLazyHandler('./actions/CartAction',
    ({ handleCart }) => (action, context) => handleCart(action as CartAction, context)),

  // API actions (all use the same handler)
  ...(() => {
    const apiHandler = createLazyHandler('./actions/ApiAction',
      ({ handleApi }) => (action, context, dispatch, abort) => handleApi(action as ApiAction, context, dispatch, abort || new Map()));
    return {
      get: apiHandler,
      post: apiHandler,
      put: apiHandler,
      patch: apiHandler,
      delete: apiHandler,
    };
  })(),
};

// Lazy load handlers on first use
const loadedHandlers = new Map<string, ActionHandler>();

/**
 * Retrieve a registered action handler by type, loading lazily if needed
 */
export async function getActionHandler(type: string): Promise<ActionHandler | undefined> {
  // Check synchronously registered handlers first (plugins)
  if (handlers.has(type)) {
    return handlers.get(type);
  }
  
  // Check already loaded lazy handlers
  if (loadedHandlers.has(type)) {
    return loadedHandlers.get(type);
  }
  
  // Try to load lazy handler
  const lazyLoader = lazyHandlers[type];
  if (lazyLoader) {
    const handler = await lazyLoader();
    loadedHandlers.set(type, handler);
    return handler;
  }
  
  return undefined;
}

// Note: Plugin handlers can be registered by third-parties under key `plugin:<name>`
// Example: registerActionHandler('plugin:myPlugin', (action, ctx) => { ... });
