import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlePixel } from '@/engine/actions/PixelAction';
import { logger } from '@/utils/logger';

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  }
}));

describe('PixelAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fire async pixel', async () => {
    const action = { type: 'pixel' as const, url: 'https://tracker.com/pixel.gif', async: true };

    const resultPromise = handlePixel(action);
    const result = await resultPromise;

    const img = document.body.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.src).toBe('https://tracker.com/pixel.gif');
    expect(img?.style.display).toBe('none');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('[Pixel] Fired async pixel'));
    expect(result.success).toBe(true);

    // Image should be removed after timeout
    await vi.advanceTimersByTimeAsync(1000);
    expect(document.body.querySelector('img')).toBeNull();
  });

  it('should fire pixel with query parameters', async () => {
    const params = { userId: '123', event: 'conversion' };
    const action = { type: 'pixel' as const, url: 'https://tracker.com/pixel.gif', params, async: true };

    await handlePixel(action);

    const img = document.body.querySelector('img');
    expect(img?.src).toContain('https://tracker.com/pixel.gif?userId=123&event=conversion');
  });

  it('should append params to existing query string', async () => {
    const action = { 
      type: 'pixel' as const, 
      url: 'https://tracker.com/pixel.gif?existing=param', 
      params: { new: 'value' },
      async: true 
    };

    await handlePixel(action);

    const img = document.body.querySelector('img');
    expect(img?.src).toContain('existing=param');
    expect(img?.src).toContain('new=value');
  });

  it('should fire synchronous pixel and wait for load', async () => {
    const action = { type: 'pixel' as const, url: 'https://tracker.com/pixel.gif', async: false };

    const resultPromise = handlePixel(action);

    // Simulate image load
    await vi.waitFor(() => {
      const img = document.body.querySelector('img');
      if (img) {
        const loadEvent = new Event('load');
        img.dispatchEvent(loadEvent);
      }
    });

    const result = await resultPromise;

    expect(result.success).toBe(true);
    expect(document.body.querySelector('img')).toBeNull(); // Should be removed after load
  });

  it('should handle synchronous pixel error', async () => {
    const action = { type: 'pixel' as const, url: 'https://tracker.com/pixel.gif', async: false };

    const resultPromise = handlePixel(action);

    // Simulate image error
    await vi.waitFor(() => {
      const img = document.body.querySelector('img');
      if (img) {
        const errorEvent = new Event('error');
        img.dispatchEvent(errorEvent);
      }
    });

    const result = await resultPromise;

    // Pixel errors return success: true (fire-and-forget pattern)
    expect(result.success).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('[Pixel]'), expect.any(Error));
  });

  it('should handle errors gracefully', async () => {
    // Simulate document.body.appendChild error
    const originalAppendChild = document.body.appendChild;
    document.body.appendChild = vi.fn().mockImplementation(() => {
      throw new Error('DOM error');
    });

    const action = { type: 'pixel' as const, url: 'https://tracker.com/pixel.gif', async: true };
    const result = await handlePixel(action);

    // Pixel errors return success: true (fire-and-forget pattern)
    expect(result.success).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('[Pixel]'), expect.any(Error));

    document.body.appendChild = originalAppendChild;
  });
});
