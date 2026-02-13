import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus, globalEventBus } from '../../engine/events/EventBus';
import { logger } from '../../utils/logger';

// Mock logger to avoid console output during tests
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should register and emit events', async () => {
      const handler = vi.fn();
      const listenerId = eventBus.on('test', handler);

      await eventBus.emit('test', 'payload');

      expect(handler).toHaveBeenCalledWith('payload');
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple listeners for the same event', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.on('test', handler1);
      eventBus.on('test', handler2);

      await eventBus.emit('test', 'data');

      expect(handler1).toHaveBeenCalledWith('data');
      expect(handler2).toHaveBeenCalledWith('data');
    });

    it('should not call listeners for different events', async () => {
      const handler = vi.fn();
      eventBus.on('test1', handler);

      await eventBus.emit('test2', 'data');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Listener management', () => {
    it('should remove listeners by ID', async () => {
      const handler = vi.fn();
      const listenerId = eventBus.on('test', handler);

      eventBus.off('test', listenerId);
      await eventBus.emit('test', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle once listeners', async () => {
      const handler = vi.fn();
      eventBus.once('test', handler);

      await eventBus.emit('test', 'first');
      await eventBus.emit('test', 'second');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('first');
    });

    it('should provide once method', async () => {
      const handler = vi.fn();
      const listenerId = eventBus.once('test', handler);

      await eventBus.emit('test', 'data');

      expect(handler).toHaveBeenCalledWith('data');
      expect(eventBus.listenerCount('test')).toBe(0);
    });
  });

  describe('Async handling', () => {
    it('should handle async listeners', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      eventBus.on('test', handler);

      await eventBus.emit('test', 'data');

      expect(handler).toHaveBeenCalledWith('data');
    });

    it('should wait for all listeners to complete', async () => {
      const results: string[] = [];
      const handler1 = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        results.push('handler1');
      });
      const handler2 = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        results.push('handler2');
      });

      eventBus.on('test', handler1);
      eventBus.on('test', handler2);

      await eventBus.emit('test');

      expect(results).toEqual(['handler2', 'handler1']); // handler2 completes first
    });
  });

  describe('Error handling', () => {
    it('should catch and log listener errors', async () => {
      const errorHandler = vi.fn().mockRejectedValue(new Error('Test error'));
      const goodHandler = vi.fn();

      eventBus.on('test', errorHandler);
      eventBus.on('test', goodHandler);

      await eventBus.emit('test', 'data');

      expect(logger.error).toHaveBeenCalledWith(
        'EventBus: Error in listener for event \'test\':',
        expect.any(Error)
      );
      expect(goodHandler).toHaveBeenCalledWith('data');
    });
  });

  describe('Utility methods', () => {
    it('should count listeners', () => {
      expect(eventBus.listenerCount('test')).toBe(0);

      eventBus.on('test', vi.fn());
      expect(eventBus.listenerCount('test')).toBe(1);

      eventBus.on('test', vi.fn());
      expect(eventBus.listenerCount('test')).toBe(2);

      eventBus.on('other', vi.fn());
      expect(eventBus.listenerCount('test')).toBe(2);
      expect(eventBus.listenerCount('other')).toBe(1);
    });

    it('should check for listeners', () => {
      expect(eventBus.hasListeners('test')).toBe(false);

      eventBus.on('test', vi.fn());
      expect(eventBus.hasListeners('test')).toBe(true);
    });

    it('should return event names', () => {
      eventBus.on('event1', vi.fn());
      eventBus.on('event2', vi.fn());
      eventBus.on('event1', vi.fn());

      const events = eventBus.eventNames();
      expect(events).toContain('event1');
      expect(events).toContain('event2');
      expect(events).toHaveLength(2);
    });

    it('should remove all listeners', () => {
      eventBus.on('event1', vi.fn());
      eventBus.on('event2', vi.fn());

      eventBus.removeAllListeners('event1');

      expect(eventBus.listenerCount('event1')).toBe(0);
      expect(eventBus.listenerCount('event2')).toBe(1);

      eventBus.removeAllListeners();

      expect(eventBus.listenerCount('event2')).toBe(0);
    });
  });

  describe('Global event bus', () => {
    it('should export a global event bus instance', () => {
      expect(globalEventBus).toBeInstanceOf(EventBus);
    });
  });
});