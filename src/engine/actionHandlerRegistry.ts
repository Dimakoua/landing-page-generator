import type { Action, DispatchResult, ActionContext } from '@/schemas/actions';

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
 * Retrieve a registered action handler by type
 */
export function getActionHandler(type: string): ActionHandler | undefined {
  return handlers.get(type);
}

/**
 * List all currently registered action types
 */
export function listRegisteredHandlers(): string[] {
  return Array.from(handlers.keys());
}

/**
 * Clear all registered handlers (mainly for testing)
 */
export function clearRegisteredHandlers() {
  handlers.clear();
}

// --- Built-in Handler Registration -------------------------------------------
// These are standard handlers that come with the engine by default.
// Using static imports for these as they are core to engine functionality.

import { handleNavigate } from './actions/NavigateAction';
import { handleClosePopup } from './actions/ClosePopupAction';
import { handleRedirect } from './actions/RedirectAction';
import { handleApi } from './actions/ApiAction';
import { handleAnalytics } from './actions/AnalyticsAction';
import { handlePixel } from './actions/PixelAction';
import { handleIframe } from './actions/IframeAction';
import { handleCustomHtml } from './actions/CustomHtmlAction';
import { handleSetState } from './actions/SetStateAction';
import { handleChain } from './actions/ChainAction';
import { handleParallel } from './actions/ParallelAction';
import { handleConditional } from './actions/ConditionalAction';
import { handleDelay } from './actions/DelayAction';
import { handleLog } from './actions/LogAction';
import { handleCart } from './actions/CartAction';

// Register core actions
registerActionHandler('navigate', (action, context) => handleNavigate(action as any, context));
registerActionHandler('closePopup', (action, context) => handleClosePopup(action as any, context));
registerActionHandler('redirect', (action) => handleRedirect(action as any));
registerActionHandler('analytics', (action, context) => handleAnalytics(action as any, context));
registerActionHandler('pixel', (action) => handlePixel(action as any));
registerActionHandler('iframe', (action) => handleIframe(action as any));
registerActionHandler('setState', (action, context) => handleSetState(action as any, context));
registerActionHandler('chain', (action, _context, dispatch) => handleChain(action as any, dispatch));
registerActionHandler('parallel', (action, _context, dispatch) => handleParallel(action as any, dispatch));
registerActionHandler('conditional', (action, context, dispatch) => handleConditional(action as any, context, dispatch));
registerActionHandler('delay', (action, _context, dispatch) => handleDelay(action as any, dispatch));
registerActionHandler('log', (action) => handleLog(action as any));
registerActionHandler('cart', (action, context) => handleCart(action as any, context));
registerActionHandler('customHtml', (action) => handleCustomHtml(action as any));

// Register API variants
const apiWrapper = (action: Action, _context: ActionContext, dispatch: any, abort?: Map<string, AbortController>) => 
  handleApi(action as any, dispatch, abort || new Map());

registerActionHandler('post', apiWrapper);
registerActionHandler('get', apiWrapper);
registerActionHandler('put', apiWrapper);
registerActionHandler('patch', apiWrapper);
registerActionHandler('delete', apiWrapper);

// Note: Plugin handlers can be registered by third-parties under key `plugin:<name>`
// Example: registerActionHandler('plugin:myPlugin', (action, ctx) => { ... });
