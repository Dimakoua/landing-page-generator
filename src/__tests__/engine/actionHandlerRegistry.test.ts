import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionDispatcher } from '@/engine/ActionDispatcher';
import { registerActionHandler, getActionHandler, clearRegisteredHandlers, listRegisteredHandlers } from '@/engine/actionHandlerRegistry';

describe('actionHandlerRegistry & plugin actions', () => {
  beforeEach(() => {
    // ensure registry is clean for tests that rely on plugin entries
    // note: built-in handlers are registered at module init; we only clear plugin entries
  });

  afterEach(() => {
    // remove any plugin handlers we registered
    clearRegisteredHandlers();
  });

  it('lets you register a plugin handler and dispatch a plugin action', async () => {
    const spy = vi.fn().mockResolvedValue({ success: true, data: { echoed: true } });

    // register handler under plugin:name key
    registerActionHandler('plugin:echo', async (action, context) => {
      spy(action, context);
      return { success: true, data: (action as any).payload };
    });

    const dispatcher = new ActionDispatcher({
      navigate: vi.fn(),
      getState: vi.fn(),
      setState: vi.fn(),
      formData: {},
      closePopup: vi.fn(),
    } as any);

    const action = { type: 'plugin' as const, name: 'echo', payload: { msg: 'hello' } };
    const res = await dispatcher.dispatch(action as any);

    expect(spy).toHaveBeenCalled();
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ msg: 'hello' });
  });

  it('getActionHandler returns registered handler key and listRegisteredHandlers contains it', async () => {
    const handler = async () => ({ success: true });
    registerActionHandler('plugin:test', handler as any);

    const got = await getActionHandler('plugin:test');
    expect(typeof got).toBe('function');
    expect(listRegisteredHandlers()).toContain('plugin:test');
  });
});
