export interface NavigateAction {
  type: 'navigate';
  url: string;
  replace?: boolean;
}

export interface ClosePopupAction {
  type: 'closePopup';
}

export interface RedirectAction {
  type: 'redirect';
  url: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
}

export interface ApiAction {
  type: 'post' | 'get' | 'put' | 'patch' | 'delete';
  url: string;
  payload?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  stateKey?: string;
  errorStateKey?: string;
  onSuccess?: Action;
  onError?: Action;
}

export interface AnalyticsAction {
  type: 'analytics';
  event: string;
  properties?: Record<string, unknown>;
  provider?: 'gtag' | 'segment' | 'mixpanel' | 'custom';
}

export interface PixelAction {
  type: 'pixel';
  url: string;
  params?: Record<string, unknown>;
  async?: boolean;
}

export interface IframeAction {
  type: 'iframe';
  src: string;
  width?: string | number;
  height?: string | number;
  target?: string;
  id?: string;
  style?: string;
}

export interface CustomHtmlAction {
  type: 'customHtml';
  html: string;
  target?: string;
  id?: string;
  position?: 'append' | 'prepend' | 'replace';
  removeAfter?: number;
}

export interface SetStateAction {
  type: 'setState';
  key: string;
  value: unknown;
  merge?: boolean;
}

export interface ChainAction {
  type: 'chain';
  actions: Action[];
  stopOnError?: boolean;
}

export interface ParallelAction {
  type: 'parallel';
  actions: Action[];
  waitForAll?: boolean;
}

export interface ConditionalAction {
  type: 'conditional';
  condition: 'stateEquals' | 'stateExists' | 'stateMatches' | 'userAgentMatches' | 'userAgentIncludes' | 'custom' | string;
  key?: string;
  value?: unknown;
  pattern?: string;
  flags?: string;
  ifTrue?: Action;
  ifFalse?: Action;
}

export interface DelayAction {
  type: 'delay';
  duration: number;
  then?: Action;
}

export interface LogAction {
  type: 'log';
  message: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  data?: unknown;
}

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

export interface PluginAction {
  type: 'plugin';
  name: string;
  params?: Record<string, unknown>;
}

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

export type ActionOrArray = Action | Action[];

export interface LifetimeActions {
  beforeMount?: ActionOrArray;
  onMount?: ActionOrArray;
  beforeUnmount?: ActionOrArray;
  onUnmount?: ActionOrArray;
}

export interface ActionContext {
  state: Record<string, unknown>;
  getState: (path?: string) => unknown;
  setState: (path: string, value: unknown, merge?: boolean) => void;
  navigate: (url: string, replace?: boolean) => void;
  closePopup?: () => void;
  trackEvent?: (event: string, properties?: unknown) => void;
  emit?: (event: string, payload?: unknown) => void;
  dispatch?: (action: Action) => Promise<unknown>;
  allowCustomHtml?: boolean;
  formData?: Record<string, unknown>;
  variant?: string;
}

export interface DispatchResult {
  success: boolean;
  error?: Error;
  data?: unknown;
}
