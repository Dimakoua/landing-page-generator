import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleLog } from '@/engine/actions/LogAction';
import { logger } from '@/utils/logger';

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }
}));

describe('LogAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log info message', async () => {
    const action = { type: 'log' as const, message: 'Test info', level: 'info' as const };

    const result = await handleLog(action);

    expect(logger.info).toHaveBeenCalledWith('Test info', undefined);
    expect(result.success).toBe(true);
  });

  it('should log warn message', async () => {
    const action = { type: 'log' as const, message: 'Test warning', level: 'warn' as const };

    const result = await handleLog(action);

    expect(logger.warn).toHaveBeenCalledWith('Test warning', undefined);
    expect(result.success).toBe(true);
  });

  it('should log error message', async () => {
    const action = { type: 'log' as const, message: 'Test error', level: 'error' as const };

    const result = await handleLog(action);

    expect(logger.error).toHaveBeenCalledWith('Test error', undefined);
    expect(result.success).toBe(true);
  });

  it('should log debug message', async () => {
    const action = { type: 'log' as const, message: 'Test debug', level: 'debug' as const };

    const result = await handleLog(action);

    expect(logger.debug).toHaveBeenCalledWith('Test debug', undefined);
    expect(result.success).toBe(true);
  });

  it('should log message with data', async () => {
    const data = { userId: 123, action: 'click' };
    const action = { type: 'log' as const, message: 'User action', level: 'info' as const, data };

    const result = await handleLog(action);

    expect(logger.info).toHaveBeenCalledWith('User action', data);
    expect(result.success).toBe(true);
  });

  it('should handle logging errors', async () => {
    const action = { type: 'log' as const, message: 'Test', level: 'info' as const };
    
    (logger.info as any).mockImplementation(() => {
      throw new Error('Logger failed');
    });

    const result = await handleLog(action);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Logger failed');
  });
});
