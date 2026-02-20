import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionDispatcher, createActionDispatcher } from '@/engine/ActionDispatcher';
import type { ActionContext, Action } from '@/schemas/actions';

// Mock all action handlers
vi.mock('@/engine/actions/NavigateAction', () => ({
  handleNavigate: vi.fn(),
}));

vi.mock('@/engine/actions/ClosePopupAction', () => ({
  handleClosePopup: vi.fn(),
}));

vi.mock('@/engine/actions/RedirectAction', () => ({
  handleRedirect: vi.fn(),
}));

vi.mock('@/engine/actions/ApiAction', () => ({
  handleApi: vi.fn(),
}));

vi.mock('@/engine/actions/AnalyticsAction', () => ({
  handleAnalytics: vi.fn(),
}));

vi.mock('@/engine/actions/PixelAction', () => ({
  handlePixel: vi.fn(),
}));

vi.mock('@/engine/actions/IframeAction', () => ({
  handleIframe: vi.fn(),
}));

vi.mock('@/engine/actions/CustomHtmlAction', () => ({
  handleCustomHtml: vi.fn(),
}));

vi.mock('@/engine/actions/SetStateAction', () => ({
  handleSetState: vi.fn(),
}));

vi.mock('@/engine/actions/ChainAction', () => ({
  handleChain: vi.fn(),
}));

vi.mock('@/engine/actions/ParallelAction', () => ({
  handleParallel: vi.fn(),
}));

vi.mock('@/engine/actions/ConditionalAction', () => ({
  handleConditional: vi.fn(),
}));

vi.mock('@/engine/actions/DelayAction', () => ({
  handleDelay: vi.fn(),
}));

vi.mock('@/engine/actions/LogAction', () => ({
  handleLog: vi.fn(),
}));

vi.mock('@/engine/actions/CartAction', () => ({
  handleCart: vi.fn(),
}));

// Import mocked handlers
import { handleNavigate } from '@/engine/actions/NavigateAction';
import { handleClosePopup } from '@/engine/actions/ClosePopupAction';
import { handleRedirect } from '@/engine/actions/RedirectAction';
import { handleApi } from '@/engine/actions/ApiAction';
import { handleAnalytics } from '@/engine/actions/AnalyticsAction';
import { handlePixel } from '@/engine/actions/PixelAction';
import { handleIframe } from '@/engine/actions/IframeAction';
import { handleCustomHtml } from '@/engine/actions/CustomHtmlAction';
import { handleSetState } from '@/engine/actions/SetStateAction';
import { handleChain } from '@/engine/actions/ChainAction';
import { handleParallel } from '@/engine/actions/ParallelAction';
import { handleConditional } from '@/engine/actions/ConditionalAction';
import { handleDelay } from '@/engine/actions/DelayAction';
import { handleLog } from '@/engine/actions/LogAction';
import { handleCart } from '@/engine/actions/CartAction';

describe('ActionDispatcher', () => {
  let mockContext: ActionContext;
  let dispatcher: ActionDispatcher;

  beforeEach(() => {
    mockContext = {
      state: {},
      getState: vi.fn(),
      setState: vi.fn(),
      navigate: vi.fn(),
      closePopup: vi.fn(),
      trackEvent: vi.fn(),
      emit: vi.fn(),
      dispatch: vi.fn(),
      allowCustomHtml: true,
    } as unknown as ActionContext;

    dispatcher = new ActionDispatcher(mockContext);

    // Clear all mocks
    vi.clearAllMocks();

    // Set default mock return values
    vi.mocked(handleNavigate).mockResolvedValue({ success: true });
    vi.mocked(handleClosePopup).mockResolvedValue({ success: true });
    vi.mocked(handleRedirect).mockResolvedValue({ success: true });
    vi.mocked(handleApi).mockResolvedValue({ success: true });
    vi.mocked(handleAnalytics).mockResolvedValue({ success: true });
    vi.mocked(handlePixel).mockResolvedValue({ success: true });
    vi.mocked(handleIframe).mockResolvedValue({ success: true });
    vi.mocked(handleCustomHtml).mockResolvedValue({ success: true });
    vi.mocked(handleSetState).mockResolvedValue({ success: true });
    vi.mocked(handleChain).mockResolvedValue({ success: true });
    vi.mocked(handleParallel).mockResolvedValue({ success: true });
    vi.mocked(handleConditional).mockResolvedValue({ success: true });
    vi.mocked(handleDelay).mockResolvedValue({ success: true });
    vi.mocked(handleLog).mockResolvedValue({ success: true });
    vi.mocked(handleCart).mockResolvedValue({ success: true });
  });

  describe('constructor', () => {
    it('should initialize with context', () => {
      expect(dispatcher).toBeInstanceOf(ActionDispatcher);
    });
  });

  describe('dispatch - validation', () => {
    it('should reject invalid action schema', async () => {
      const invalidAction = { type: 'invalid' } as any;

      const result = await dispatcher.dispatch(invalidAction);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('Action validation failed');
    });

    it('should reject action with missing required fields', async () => {
      const invalidAction = { type: 'navigate' } as any; // missing url

      const result = await dispatcher.dispatch(invalidAction);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe('dispatch - action routing', () => {
    it('should route navigate action to handleNavigate', async () => {
      const action: Action = { type: 'navigate', url: '/success' };

      const result = await dispatcher.dispatch(action);

      expect(handleNavigate).toHaveBeenCalledWith(action, mockContext);
      expect(result.success).toBe(true);
    });

    it('should route closePopup action to handleClosePopup', async () => {
      const action: Action = { type: 'closePopup' };

      const result = await dispatcher.dispatch(action);

      expect(handleClosePopup).toHaveBeenCalledWith(action, mockContext);
      expect(result.success).toBe(true);
    });

    it('should route redirect action to handleRedirect', async () => {
      const action: Action = { type: 'redirect', url: 'https://example.com' };

      const result = await dispatcher.dispatch(action);

      expect(handleRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'redirect', url: 'https://example.com', target: '_self' })
      );
      expect(result.success).toBe(true);
    });

    it('should route API actions to handleApi', async () => {
      const action: Action = { type: 'post', url: 'https://api.example.com' };

      const result = await dispatcher.dispatch(action);

      expect(handleApi).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'post', url: 'https://api.example.com', timeout: 10000, retries: 0 }),
        expect.any(Object) /* context */,
        expect.any(Function) /* dispatch */, 
        expect.any(Map) /* abortControllers */
      );
      expect(result.success).toBe(true);
    });

    it('should route analytics action to handleAnalytics', async () => {
      const action: Action = { type: 'analytics', event: 'cta_clicked' };

      const result = await dispatcher.dispatch(action);

      expect(handleAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'analytics', event: 'cta_clicked', provider: 'gtag' }),
        mockContext
      );
      expect(result.success).toBe(true);
    });

    it('should route pixel action to handlePixel', async () => {
      const action: Action = { type: 'pixel', url: 'https://pixel.example.com' };

      const result = await dispatcher.dispatch(action);

      expect(handlePixel).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'pixel', url: 'https://pixel.example.com', async: true })
      );
      expect(result.success).toBe(true);
    });

    it('should route iframe action to handleIframe', async () => {
      const action: Action = { type: 'iframe', src: 'https://iframe.example.com' };

      const result = await dispatcher.dispatch(action);

      expect(handleIframe).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'iframe', src: 'https://iframe.example.com', width: '1', height: '1' })
      );
      expect(result.success).toBe(true);
    });

    it('should route customHtml action to handleCustomHtml when allowed', async () => {
      const action: Action = { type: 'customHtml', html: '<div>test</div>' };

      const result = await dispatcher.dispatch(action);

      expect(handleCustomHtml).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'customHtml', html: '<div>test</div>', target: 'body', position: 'append' })
      );
      expect(result.success).toBe(true);
    });

    it('should block customHtml action when not allowed by context', async () => {
      // Create dispatcher with policy disabled
      const ctx = { ...mockContext, allowCustomHtml: false } as any;
      const blockedDispatcher = new ActionDispatcher(ctx);

      const action: Action = { type: 'customHtml', html: '<div>blocked</div>' };
      const result = await blockedDispatcher.dispatch(action);

      expect(handleCustomHtml).not.toHaveBeenCalledWith(expect.objectContaining({ html: '<div>blocked</div>' }));
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('blocked by policy');
    });

    it('should route setState action to handleSetState', async () => {
      const action: Action = { type: 'setState', key: 'test', value: 'value' };

      const result = await dispatcher.dispatch(action);

      expect(handleSetState).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'setState', key: 'test', value: 'value', merge: true }),
        mockContext
      );
      expect(result.success).toBe(true);
    });

    it('should route chain action to handleChain', async () => {
      const action: Action = { type: 'chain', actions: [] };

      const result = await dispatcher.dispatch(action);

      expect(handleChain).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'chain', actions: [] }),
        expect.any(Function)
      );
      expect(result.success).toBe(true);
    });

    it('should route parallel action to handleParallel', async () => {
      const action: Action = { type: 'parallel', actions: [] };

      const result = await dispatcher.dispatch(action);

      expect(handleParallel).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'parallel', actions: [] }),
        expect.any(Function)
      );
      expect(result.success).toBe(true);
    });

    it('should route conditional action to handleConditional', async () => {
      const action: Action = {
        type: 'conditional',
        condition: 'stateEquals',
        ifTrue: { type: 'log', message: 'true' }
      };

      const result = await dispatcher.dispatch(action);

      expect(handleConditional).toHaveBeenCalledWith(action, mockContext, expect.any(Function));
      expect(result.success).toBe(true);
    });

    it('should route delay action to handleDelay', async () => {
      const action: Action = { type: 'delay', duration: 1000 };

      const result = await dispatcher.dispatch(action);

      expect(handleDelay).toHaveBeenCalledWith(action, expect.any(Function));
      expect(result.success).toBe(true);
    });

    it('should route log action to handleLog', async () => {
      const action: Action = { type: 'log', message: 'test message' };

      const result = await dispatcher.dispatch(action);

      expect(handleLog).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'log', message: 'test message', level: 'info' })
      );
      expect(result.success).toBe(true);
    });

    it('should route cart action to handleCart', async () => {
      const action: Action = { type: 'cart', operation: 'add' };

      const result = await dispatcher.dispatch(action);

      expect(handleCart).toHaveBeenCalledWith(action, mockContext);
      expect(result.success).toBe(true);
    });

    it('should reject unknown action type', async () => {
      const unknownAction = { type: 'unknown' } as any;

      const result = await dispatcher.dispatch(unknownAction);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('Action validation failed');
    });
  });

  describe('dispatch - error handling', () => {
    it('should handle handler errors gracefully', async () => {
      const mockError = new Error('Handler failed');
      vi.mocked(handleNavigate).mockRejectedValueOnce(mockError);

      const action: Action = { type: 'navigate', url: '/test' };

      const result = await dispatcher.dispatch(action);

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(handleNavigate).mockRejectedValueOnce('string error');

      const action: Action = { type: 'navigate', url: '/test' };

      const result = await dispatcher.dispatch(action);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('string error');
    });
  });

  describe('cancelAll', () => {
    it('should cancel all pending requests', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();

      // Simulate adding controllers to the map
      (dispatcher as any).abortControllers.set('req1', controller1);
      (dispatcher as any).abortControllers.set('req2', controller2);

      const abortSpy1 = vi.spyOn(controller1, 'abort');
      const abortSpy2 = vi.spyOn(controller2, 'abort');

      dispatcher.cancelAll();

      expect(abortSpy1).toHaveBeenCalled();
      expect(abortSpy2).toHaveBeenCalled();
      expect((dispatcher as any).abortControllers.size).toBe(0);
    });
  });

  describe('dispatchNamed', () => {
    it('should dispatch action by name from actions map', async () => {
      const actionsMap = {
        testAction: { type: 'navigate', url: '/test' } as Action
      };

      const result = await dispatcher.dispatchNamed('testAction', actionsMap);

      expect(handleNavigate).toHaveBeenCalledWith(actionsMap.testAction, mockContext);
      expect(result.success).toBe(true);
    });

    it('should return error for non-existent action name', async () => {
      const actionsMap = {};

      const result = await dispatcher.dispatchNamed('missingAction', actionsMap);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('Action not found: missingAction');
    });
  });

  describe('getState', () => {
    it('should delegate to context.getState', () => {
      const mockState = { key: 'value' };
      vi.mocked(mockContext.getState).mockReturnValue(mockState);

      const result = dispatcher.getState();

      expect(mockContext.getState).toHaveBeenCalledWith(undefined);
      expect(result).toBe(mockState);
    });

    it('should pass key to context.getState when provided', () => {
      const mockValue = 'test value';
      vi.mocked(mockContext.getState).mockReturnValue(mockValue);

      const result = dispatcher.getState('testKey');

      expect(mockContext.getState).toHaveBeenCalledWith('testKey');
      expect(result).toBe(mockValue);
    });
  });

  describe('createActionDispatcher factory', () => {
    it('should create ActionDispatcher instance', () => {
      const dispatcher = createActionDispatcher(mockContext);

      expect(dispatcher).toBeInstanceOf(ActionDispatcher);
    });
  });

  describe('AbortController management', () => {
    it('should register and abort component-specific controllers', () => {
      const controller = new AbortController();
      const abortSpy = vi.spyOn(controller, 'abort');

      dispatcher.registerController('test-comp', controller);
      dispatcher.abortComponent('test-comp');

      expect(abortSpy).toHaveBeenCalled();
    });

    it('should cancel all controllers when cancelAll is called', () => {
      const c1 = new AbortController();
      const c2 = new AbortController();
      const s1 = vi.spyOn(c1, 'abort');
      const s2 = vi.spyOn(c2, 'abort');

      dispatcher.registerController('c1', c1);
      dispatcher.registerController('c2', c2);

      dispatcher.cancelAll();

      expect(s1).toHaveBeenCalled();
      expect(s2).toHaveBeenCalled();
    });
  });
});
