import { logger } from '../../utils/logger';
import type { Action, DispatchResult, ActionContext } from '../../schemas/actions';

// Import all action handlers
import { handleNavigate } from './NavigateAction';
import { handleClosePopup } from './ClosePopupAction';
import { handleRedirect } from './RedirectAction';
import { handleApi } from './ApiAction';
import { handleAnalytics } from './AnalyticsAction';
import { handlePixel } from './PixelAction';
import { handleIframe } from './IframeAction';
import { handleCustomHtml } from './CustomHtmlAction';
import { handleSetState } from './SetStateAction';
import { handleChain } from './ChainAction';
import { handleParallel } from './ParallelAction';
import { handleConditional } from './ConditionalAction';
import { handleDelay } from './DelayAction';
import { handleLog } from './LogAction';
import { handleCart } from './CartAction';

/**
 * Action handler signature: receives action, context, and dispatch function
 * Returns a promise with execution result
 * Note: API actions also receive abortControllers as 4th parameter
 */
export type ActionHandler = (
  action: Action,
  context: ActionContext,
  dispatch: (action: Action) => Promise<DispatchResult>,
  ...args: any[]
) => Promise<DispatchResult>;

/**
 * Action registry: Maps action type → handler function
 *
 * Benefits:
 * - ✅ Adding new actions requires only 1 line (not modifying ActionDispatcher)
 * - ✅ Violates Open/Closed Principle (additive, not modifying)
 * - ✅ Handlers are self-contained and independently testable
 * - ✅ Scales to 50+ actions without performance impact
 * - ✅ Self-documenting: shows all available actions
 *
 * Adding a new action:
 * 1. Create handler in appropriate subfolder (e.g., utils/MyHandler.ts)
 * 2. Import at top
 * 3. Add one line to ACTION_REGISTRY
 * 4. That's it!
 */
export const ACTION_REGISTRY: Record<string, ActionHandler> = {
  // ==================== Navigation ====================
  navigate: (action, _context, _dispatch) =>
    handleNavigate(action as any, _context),
  closePopup: (action, _context) =>
    handleClosePopup(action as any, _context),
  redirect: (action) =>
    handleRedirect(action as any),

  // ==================== Networking (API, Pixels, Iframes) ====================
  post: (action, _context, dispatch) =>
    handleApi(action as any, dispatch, new Map()),
  get: (action, _context, dispatch) =>
    handleApi(action as any, dispatch, new Map()),
  put: (action, _context, dispatch) =>
    handleApi(action as any, dispatch, new Map()),
  patch: (action, _context, dispatch) =>
    handleApi(action as any, dispatch, new Map()),
  delete: (action, _context, dispatch) =>
    handleApi(action as any, dispatch, new Map()),
  pixel: (action) =>
    handlePixel(action as any),
  iframe: (action) =>
    handleIframe(action as any),

  // ==================== Analytics & Tracking ====================
  analytics: (action, _context) =>
    handleAnalytics(action as any, _context),
  customHtml: (action) =>
    handleCustomHtml(action as any),

  // ==================== State Management ====================
  setState: (action, _context) =>
    handleSetState(action as any, _context),
  cart: (action, _context) =>
    handleCart(action as any, _context),

  // ==================== Control Flow ====================
  chain: (action, _context, dispatch) =>
    handleChain(action as any, dispatch),
  parallel: (action, _context, dispatch) =>
    handleParallel(action as any, dispatch),
  conditional: (action, _context, dispatch) =>
    handleConditional(action as any, _context, dispatch),
  delay: (action, _context, dispatch) =>
    handleDelay(action as any, dispatch),

  // ==================== Utilities ====================
  log: (action) =>
    handleLog(action as any),
};

/**
 * Get handler for an action type
 *
 * @param actionType Action type string (e.g., 'navigate', 'post')
 * @returns Handler function or null if not found
 */
export function getActionHandler(actionType: string): ActionHandler | null {
  const handler = ACTION_REGISTRY[actionType];
  if (!handler) {
    logger.warn(`[ActionRegistry] Unknown action type: ${actionType}`);
    return null;
  }
  return handler;
}

/**
 * Get all registered action types
 *
 * @returns Array of action type strings
 */
export function getRegisteredActionTypes(): string[] {
  return Object.keys(ACTION_REGISTRY);
}

/**
 * Get action registry stats
 *
 * @returns Object with registry metadata
 */
export function getActionRegistryStats() {
  return {
    totalActions: Object.keys(ACTION_REGISTRY).length,
    actionTypes: getRegisteredActionTypes(),
    categories: {
      navigation: ['navigate', 'closePopup', 'redirect'],
      networking: ['post', 'get', 'put', 'patch', 'delete', 'pixel', 'iframe'],
      analytics: ['analytics', 'customHtml'],
      state: ['setState', 'cart'],
      controlFlow: ['chain', 'parallel', 'conditional', 'delay'],
      utilities: ['log'],
    },
  };
}
