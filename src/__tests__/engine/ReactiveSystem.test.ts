import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReactiveSystem, reactiveSystem } from '../engine/ReactiveSystem';
import { globalEventBus } from '../engine/events/EventBus';
import { EVENT_TYPES } from '../engine/events/types';

// Mock window analytics providers
const mockWindow = {
  gtag: vi.fn(),
  analytics: { track: vi.fn() },
  mixpanel: { track: vi.fn() }
};

Object.defineProperty(window, 'gtag', { value: mockWindow.gtag, writable: true });
Object.defineProperty(window, 'analytics', { value: mockWindow.analytics, writable: true });
Object.defineProperty(window, 'mixpanel', { value: mockWindow.mixpanel, writable: true });

describe('ReactiveSystem', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    // Reset reactive system
    reactiveSystem.stop();
  });

  afterEach(() => {
    reactiveSystem.stop();
  });

  it('should start and stop the reactive system', () => {
    expect(reactiveSystem['isActive']).toBe(false);

    reactiveSystem.start();
    expect(reactiveSystem['isActive']).toBe(true);

    reactiveSystem.stop();
    expect(reactiveSystem['isActive']).toBe(false);
  });

  it('should handle analytics events and forward to providers', async () => {
    reactiveSystem.start();

    const analyticsEvent = {
      type: EVENT_TYPES.ANALYTICS_EVENT,
      event: 'test_event',
      properties: { test: 'value' },
      provider: 'gtag'
    };

    await globalEventBus.emit(EVENT_TYPES.ANALYTICS_EVENT, analyticsEvent);

    expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'test_event', { test: 'value' });
  });

  it('should handle user interaction events', async () => {
    reactiveSystem.start();

    const interactionEvent = {
      type: EVENT_TYPES.USER_INTERACTION,
      interactionType: 'button_click',
      component: 'TestComponent'
    };

    await globalEventBus.emit(EVENT_TYPES.USER_INTERACTION, interactionEvent);

    // Should forward to analytics
    expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'user_interaction', expect.objectContaining({
      interactionType: 'button_click',
      component: 'TestComponent'
    }));
  });

  it('should handle state change events', async () => {
    reactiveSystem.start();

    const stateEvent = {
      type: EVENT_TYPES.STATE_UPDATED,
      key: 'cart',
      value: { items: [] },
      previousValue: null,
      source: 'TestComponent'
    };

    await globalEventBus.emit(EVENT_TYPES.STATE_UPDATED, stateEvent);

    // Should emit cart analytics event
    expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'cart_updated', expect.objectContaining({
      cartValue: { items: [] },
      source: 'TestComponent'
    }));
  });

  it('should handle component lifecycle events', async () => {
    reactiveSystem.start();

    const mountEvent = {
      type: EVENT_TYPES.COMPONENT_MOUNTED,
      component: 'TestComponent',
      componentId: 'test-1'
    };

    await globalEventBus.emit(EVENT_TYPES.COMPONENT_MOUNTED, mountEvent);

    // Component events are logged but don't trigger analytics
    expect(mockWindow.gtag).not.toHaveBeenCalled();
  });

  it('should handle error events', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    reactiveSystem.start();

    const errorEvent = {
      type: EVENT_TYPES.ERROR,
      message: 'Test error',
      component: 'TestComponent'
    };

    await globalEventBus.emit(EVENT_TYPES.ERROR, errorEvent);

    expect(consoleSpy).toHaveBeenCalledWith('[ReactiveSystem] Application error:', expect.objectContaining({
      message: 'Test error',
      component: 'TestComponent'
    }));

    consoleSpy.mockRestore();
  });

  it('should gracefully handle analytics forwarding failures', async () => {
    reactiveSystem.start();

    // Make gtag throw an error
    mockWindow.gtag.mockImplementation(() => {
      throw new Error('Analytics error');
    });

    const analyticsEvent = {
      type: EVENT_TYPES.ANALYTICS_EVENT,
      event: 'test_event',
      properties: { test: 'value' }
    };

    // Should not throw
    await expect(globalEventBus.emit(EVENT_TYPES.ANALYTICS_EVENT, analyticsEvent)).resolves.not.toThrow();
  });

  it('should not start twice', () => {
    reactiveSystem.start();
    expect(reactiveSystem['isActive']).toBe(true);

    // Starting again should not change state
    reactiveSystem.start();
    expect(reactiveSystem['isActive']).toBe(true);
  });

  it('should handle multiple analytics providers', async () => {
    reactiveSystem.start();

    const analyticsEvent = {
      type: EVENT_TYPES.ANALYTICS_EVENT,
      event: 'multi_provider_test',
      properties: { test: 'multi' }
    };

    await globalEventBus.emit(EVENT_TYPES.ANALYTICS_EVENT, analyticsEvent);

    // Should try all providers (gtag is first and succeeds)
    expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'multi_provider_test', { test: 'multi' });
    expect(mockWindow.analytics.track).not.toHaveBeenCalled();
    expect(mockWindow.mixpanel.track).not.toHaveBeenCalled();
  });
});