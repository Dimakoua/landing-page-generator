// Manual type definitions for actions

// ==================== Action Type Interfaces ====================

// Navigate to another step in the funnel
export interface NavigateAction {
  type: 'navigate';
  url: string;
  replace?: boolean;
}

// Close active popup
export interface ClosePopupAction {
  type: 'closePopup';
}

// Redirect to external URL
export interface RedirectAction {
  type: 'redirect';
  url: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
}

// HTTP Request Actions
export interface ApiAction {
  type: 'post' | 'get' | 'put' | 'patch' | 'delete';
  url: string;
  payload?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  onSuccess?: Action;
  onError?: Action;
}

// Analytics/Tracking
export interface AnalyticsAction {
  type: 'analytics';
  event: string;
  properties?: Record<string, any>;
  provider?: 'gtag' | 'segment' | 'mixpanel' | 'custom';
}

// Fire tracking pixel
export interface PixelAction {
  type: 'pixel';
  url: string;
  params?: Record<string, any>;
  async?: boolean;
}

// Iframe
export interface IframeAction {
  type: 'iframe';
  src: string;
  width?: string | number;
  height?: string | number;
  target?: string;
  id?: string;
  style?: string;
}

// Custom HTML
export interface CustomHtmlAction {
  type: 'customHtml';
  html: string;
  target?: string;
  id?: string;
  position?: 'append' | 'prepend' | 'replace';
  removeAfter?: number;
}

// State management
export interface SetStateAction {
  type: 'setState';
  key: string;
  value: any;
  merge?: boolean;
}

// Chain actions
export interface ChainAction {
  type: 'chain';
  actions: Action[];
  stopOnError?: boolean;
}

// Parallel actions
export interface ParallelAction {
  type: 'parallel';
  actions: Action[];
  waitForAll?: boolean;
}

// Conditional action
export interface ConditionalAction {
  type: 'conditional';
  condition: string;
  key?: string;
  value?: any;
  ifTrue?: Action;
  ifFalse?: Action;
}

// Delay
export interface DelayAction {
  type: 'delay';
  duration: number;
  then?: Action;
}

// Log
export interface LogAction {
  type: 'log';
  message: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  data?: any;
}

// Cart
export interface CartAction {
  type: 'cart';
  operation: 'add' | 'remove' | 'updateQuantity' | 'update' | 'clear';
  itemId?: string;
  quantity?: number;
  color?: string;
  item?: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category?: string;
    color?: string;
    quantity?: number;
  };
}

// Plugin
export interface PluginAction {
  type: 'plugin';
  name: string;
  params?: Record<string, any>;
}

// Union of all action types
export type Action =
  | NavigateAction
  | ClosePopupAction
  | RedirectAction
  | ApiAction
  | AnalyticsAction
  | PixelAction
  | IframeAction
  | CustomHtmlAction
  | SetStateAction
  | ChainAction
  | ParallelAction
  | ConditionalAction
  | DelayAction
  | LogAction
  | CartAction
  | PluginAction;

// ==================== Action Context ====================

export interface ActionContext {
  state: Record<string, any>;
  getState: (path?: string) => any;
  setState: (path: string, value: any, merge?: boolean) => void;
  navigate: (url: string, replace?: boolean) => void;
  closePopup?: () => void;
  trackEvent?: (event: string, properties?: any) => void;
  emit?: (event: string, payload?: any) => void;
  dispatch?: (action: Action) => Promise<any>;
  allowCustomHtml?: boolean;
  formData?: Record<string, any>;
  variant?: string;
}

// ==================== Dispatch Result ====================

export interface DispatchResult {
  success: boolean;
  error?: Error;
  data?: any;
}