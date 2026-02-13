import type { Action, DispatchResult } from '@/schemas/actions';
import type { ActionContext } from '@/schemas/actions';

export type ActionHandler = (
  action: Action,
  context: ActionContext,
  dispatch: (action: Action) => Promise<DispatchResult>,
  abortControllers?: Map<string, AbortController>
) => Promise<DispatchResult>;

const handlers: Map<string, ActionHandler> = new Map();

export function registerActionHandler(type: string, handler: ActionHandler) {
  handlers.set(type, handler);
}

export function getActionHandler(type: string): ActionHandler | undefined {
  return handlers.get(type);
}

export function listRegisteredHandlers(): string[] {
  return Array.from(handlers.keys());
}

export function clearRegisteredHandlers() {
  handlers.clear();
}

// --- Register built-in wrappers at module init ---------------------------------
// Delay importing heavy handler implementations until here so tests can mock them
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

// Wrapper helpers
const wrapSimple = (fn: (a: any, ctx?: any) => Promise<DispatchResult>) =>
  (action: Action, context: ActionContext) => fn(action as any, context);

const wrapWithDispatch = (fn: (a: any, dispatch: any, abort?: Map<string, AbortController>) => Promise<DispatchResult>) =>
  (action: Action, _context: ActionContext, dispatch: any, abortControllers?: Map<string, AbortController>) => fn(action as any, dispatch, abortControllers);

// Register built-in handlers
registerActionHandler('navigate', (action, context) => handleNavigate(action as any, context));
registerActionHandler('closePopup', (action, context) => handleClosePopup(action as any, context));
registerActionHandler('redirect', (action) => handleRedirect(action as any));
registerActionHandler('post', (action, context, dispatch, abort) => handleApi(action as any, dispatch, abort));
registerActionHandler('get', (action, context, dispatch, abort) => handleApi(action as any, dispatch, abort));
registerActionHandler('put', (action, context, dispatch, abort) => handleApi(action as any, dispatch, abort));
registerActionHandler('patch', (action, context, dispatch, abort) => handleApi(action as any, dispatch, abort));
registerActionHandler('delete', (action, context, dispatch, abort) => handleApi(action as any, dispatch, abort));
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

// customHtml must still respect action context policy — actual check performed by ActionDispatcher
registerActionHandler('customHtml', (action) => handleCustomHtml(action as any));

// Plugin handlers are registered by third-parties under key `plugin:<name>`
// Example: registerActionHandler('plugin:myPlugin', (action, ctx) => { ... });

// End built-in registration ----------------------------------------------------
