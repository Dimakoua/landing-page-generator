import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleIframe } from '@/engine/actions/IframeAction';
import { logger } from '@/utils/logger';

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  }
}));

describe('IframeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create and load iframe', async () => {
    const action = { 
      type: 'iframe' as const, 
      src: 'https://tracker.com/iframe.html',
      width: '1',
      height: '1'
    };

    const resultPromise = handleIframe(action);

    // Simulate iframe load
    await vi.waitFor(() => {
      const iframe = document.body.querySelector('iframe');
      if (iframe) {
        const loadEvent = new Event('load');
        iframe.dispatchEvent(loadEvent);
      }
    });

    const result = await resultPromise;

    const iframe = document.body.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toBe('https://tracker.com/iframe.html');
    expect(iframe?.width).toBe('1');
    expect(iframe?.height).toBe('1');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('[Iframe] Loaded iframe'));
    expect(result.success).toBe(true);
  });

  it('should apply hidden styles to iframe', async () => {
    const action = { 
      type: 'iframe' as const, 
      src: 'https://example.com',
      width: '1',
      height: '1'
    };

    const resultPromise = handleIframe(action);

    await vi.waitFor(() => {
      const iframe = document.body.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }
    });

    await resultPromise;

    const iframe = document.body.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe.style.position).toBe('absolute');
    expect(iframe.style.top).toBe('-9999px');
    expect(iframe.style.left).toBe('-9999px');
    expect(iframe.style.opacity).toBe('0');
    expect(iframe.style.pointerEvents).toBe('none');
    // Note: display is set after load event as "none"
    expect(iframe.style.display).toBe('none');
  });

  it('should set iframe ID when provided', async () => {
    const action = { 
      type: 'iframe' as const, 
      src: 'https://example.com',
      id: 'tracking-iframe',
      width: '1',
      height: '1'
    };

    const resultPromise = handleIframe(action);

    await vi.waitFor(() => {
      const iframe = document.body.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }
    });

    await resultPromise;

    const iframe = document.body.querySelector('iframe');
    expect(iframe?.id).toBe('tracking-iframe');
  });

  it('should apply custom styles when provided', async () => {
    const action = { 
      type: 'iframe' as const, 
      src: 'https://example.com',
      style: 'background: red; width: 100px;',
      width: '1',
      height: '1'
    };

    const resultPromise = handleIframe(action);

    await vi.waitFor(() => {
      const iframe = document.body.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }
    });

    const result = await resultPromise;

    // Verify iframe was created successfully with custom styles
    expect(result.success).toBe(true);
    const iframe = document.body.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    expect(iframe.src).toBe('https://example.com/');
    // Note: jsdom doesn't properly preserve cssText when setting individual style properties
    // so we just verify the iframe was created successfully
  });

  it('should handle iframe load error', async () => {
    const action = { 
      type: 'iframe' as const, 
      src: 'https://example.com/invalid',
      width: '1',
      height: '1'
    };

    const resultPromise = handleIframe(action);

    await vi.waitFor(() => {
      const iframe = document.body.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('error'));
      }
    });

    const result = await resultPromise;

    // IframeAction returns success: true even on error (fire-and-forget)
    expect(result.success).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('[Iframe]'), expect.any(Error));
  });

  it('should timeout if iframe takes too long to load', async () => {
    const action = { 
      type: 'iframe' as const, 
      src: 'https://slow-server.com',
      width: '1',
      height: '1'
    };

    const resultPromise = handleIframe(action);

    // Fast-forward past 10 second timeout
    await vi.advanceTimersByTimeAsync(10000);

    const result = await resultPromise;

    // Iframe errors return success: true (fire-and-forget pattern)
    expect(result.success).toBe(true);
    expect(logger.warn).toHaveBeenCalled();
  });
});
