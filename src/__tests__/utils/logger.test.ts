import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@/utils/logger';

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

describe('Logger', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    Object.values(consoleSpy).forEach(spy => spy.mockClear());
  });

  describe('debug method', () => {
    it('logs debug messages in dev mode', () => {
      // Assuming we're in dev mode (import.meta.env.DEV is true)
      logger.debug('Debug message');

      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] Debug message');
    });

    it('logs debug messages with data', () => {
      logger.debug('Debug message', { key: 'value' });

      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] Debug message', { key: 'value' });
    });
  });

  describe('info method', () => {
    it('logs info messages in dev mode', () => {
      logger.info('Info message');

      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Info message');
    });

    it('logs info messages with data', () => {
      logger.info('Info message', { data: 'test' });

      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Info message', { data: 'test' });
    });
  });

  describe('warn method', () => {
    it('logs warning messages', () => {
      logger.warn('Warning message');

      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Warning message');
    });

    it('logs warning messages with data', () => {
      logger.warn('Warning message', { error: 'test' });

      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Warning message', { error: 'test' });
    });
  });

  describe('error method', () => {
    it('logs error messages', () => {
      logger.error('Error message');

      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Error message');
    });

    it('logs error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Error occurred', error);
    });
  });

  describe('prefix behavior', () => {
    it('includes consistent prefix in all messages', () => {
      logger.debug('debug test');
      logger.info('info test');
      logger.warn('warn test');
      logger.error('error test');

      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG] debug test');
      expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] info test');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] warn test');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] error test');
    });
  });
});