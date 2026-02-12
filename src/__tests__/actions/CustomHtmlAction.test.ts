import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCustomHtml } from '@/engine/actions/CustomHtmlAction';
import { logger } from '@/utils/logger';

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  }
}));

describe('CustomHtmlAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should inject HTML into body by default', async () => {
    const action = { 
      type: 'customHtml' as const, 
      html: '<div class="test">Hello</div>',
      target: 'body' as const,
      position: 'append' as const
    };

    const result = await handleCustomHtml(action);

    expect(document.body.innerHTML).toContain('<div class="test">Hello</div>');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('[CustomHtml] Rendered'));
    expect(result.success).toBe(true);
  });

  it('should inject HTML into head when specified', async () => {
    const action = { 
      type: 'customHtml' as const, 
      html: '<meta name="test" content="value">',
      target: 'head' as const,
      position: 'append' as const
    };

    const result = await handleCustomHtml(action);

    expect(document.head.innerHTML).toContain('<meta name="test" content="value">');
    expect(result.success).toBe(true);
  });

  it('should prepend HTML when position is prepend', async () => {
    document.body.innerHTML = '<div id="existing">Existing</div>';
    
    const action = { 
      type: 'customHtml' as const, 
      html: '<div id="new">New</div>',
      target: 'body' as const,
      position: 'prepend' as const
    };

    await handleCustomHtml(action);

    const firstChild = document.body.firstElementChild;
    // The container div is prepended, which contains the new div
    expect(firstChild?.innerHTML).toContain('<div id="new">New</div>');
  });

  it('should append HTML when position is append', async () => {
    document.body.innerHTML = '<div id="existing">Existing</div>';
    
    const action = { 
      type: 'customHtml' as const, 
      html: '<div id="new">New</div>',
      target: 'body' as const,
      position: 'append' as const
    };

    await handleCustomHtml(action);

    const lastChild = document.body.lastElementChild;
    expect(lastChild?.innerHTML).toContain('<div id="new">New</div>');
  });

  it('should set ID on container when provided', async () => {
    const action = { 
      type: 'customHtml' as const, 
      html: '<span>Content</span>',
      id: 'custom-container',
      target: 'body' as const,
      position: 'append' as const
    };

    await handleCustomHtml(action);

    const container = document.getElementById('custom-container');
    expect(container).toBeTruthy();
    expect(container?.innerHTML).toBe('<span>Content</span>');
  });

  it('should remove HTML after specified duration', async () => {
    const action = { 
      type: 'customHtml' as const, 
      html: '<div id="temp">Temporary</div>',
      target: 'body' as const,
      position: 'append' as const,
      removeAfter: 2000
    };

    await handleCustomHtml(action);

    expect(document.body.innerHTML).toContain('Temporary');

    await vi.advanceTimersByTimeAsync(2000);

    expect(document.body.innerHTML).not.toContain('Temporary');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Removed HTML after 2000ms'));
  });

  it('should not remove if removeAfter is 0', async () => {
    const action = { 
      type: 'customHtml' as const, 
      html: '<div>Permanent</div>',
      target: 'body' as const,
      position: 'append' as const,
      removeAfter: 0
    };

    await handleCustomHtml(action);

    await vi.advanceTimersByTimeAsync(5000);

    expect(document.body.innerHTML).toContain('Permanent');
  });

  it('should handle injection errors gracefully', async () => {
    const action = { 
      type: 'customHtml' as const, 
      html: '<div>Test</div>',
      target: 'body' as const,
      position: 'append' as const
    };

    const originalAppendChild = document.body.appendChild;
    document.body.appendChild = vi.fn().mockImplementation(() => {
      throw new Error('DOM error');
    });

    const result = await handleCustomHtml(action);

    // Should return success even on error (non-breaking)
    expect(result.success).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('[CustomHtml] Failed'), expect.any(Error));

    document.body.appendChild = originalAppendChild;
  });

  it('should handle complex HTML with scripts', async () => {
    const action = { 
      type: 'customHtml' as const, 
      html: '<div><script>console.log("test")</script><p>Content</p></div>',
      target: 'body' as const,
      position: 'append' as const
    };

    const result = await handleCustomHtml(action);

    expect(document.body.innerHTML).toContain('Content');
    expect(result.success).toBe(true);
  });
});
