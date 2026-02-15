import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleNavigate } from '@/engine/actions/NavigateAction';
import type { ActionContext } from '@/schemas/actions';

describe('NavigateAction', () => {
  let mockContext: ActionContext;

  beforeEach(() => {
    mockContext = {
      navigate: vi.fn(),
      getState: vi.fn(),
      setState: vi.fn(),
      formData: {},
    } as any;
  });

  it('should call context.navigate with URL', async () => {
    const action = { type: 'navigate' as const, url: '/checkout' };

    const result = await handleNavigate(action, mockContext);

    expect(mockContext.navigate).toHaveBeenCalledWith('/checkout', undefined);
    expect(result.success).toBe(true);
  });

  it('should call context.navigate with replace flag', async () => {
    const action = { type: 'navigate' as const, url: '/success', replace: true };

    const result = await handleNavigate(action, mockContext);

    expect(mockContext.navigate).toHaveBeenCalledWith('/success', true);
    expect(result.success).toBe(true);
  });

  it('should handle navigation errors', async () => {
    const error = new Error('Navigation failed');
    mockContext.navigate = vi.fn().mockImplementation(() => {
      throw error;
    });

    const action = { type: 'navigate' as const, url: '/checkout' };
    const result = await handleNavigate(action, mockContext);

    expect(result.success).toBe(false);
    expect(result.error).toEqual(error);
  });

  it('should handle replace: false explicitly', async () => {
    const action = { type: 'navigate' as const, url: '/step2', replace: false };

    const result = await handleNavigate(action, mockContext);

    expect(mockContext.navigate).toHaveBeenCalledWith('/step2', false);
    expect(result.success).toBe(true);
  });

  it('should scroll to anchor element for fragment URLs', async () => {
    // Create a mock element with scrollIntoView
    const mockElement = {
      scrollIntoView: vi.fn(),
    };
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

    // Use fake timers to handle setTimeout
    vi.useFakeTimers();

    const action = { type: 'navigate' as const, url: '#specs' };
    const result = await handleNavigate(action, mockContext);

    // Run the setTimeout
    vi.runAllTimers();

    expect(getElementByIdSpy).toHaveBeenCalledWith('specs');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(result.success).toBe(true);

    // Cleanup
    vi.useRealTimers();
    getElementByIdSpy.mockRestore();
  });

  it('should handle missing anchor element gracefully', async () => {
    const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(null);
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.useFakeTimers();

    const action = { type: 'navigate' as const, url: '#missing' };
    const result = await handleNavigate(action, mockContext);

    vi.runAllTimers();

    expect(getElementByIdSpy).toHaveBeenCalledWith('missing');
    expect(consoleWarnSpy).toHaveBeenCalledWith('Anchor element with id="missing" not found');
    expect(result.success).toBe(true);

    // Cleanup
    vi.useRealTimers();
    getElementByIdSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should open external URLs in new tab', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const action = { type: 'navigate' as const, url: 'https://example.com' };
    const result = await handleNavigate(action, mockContext);

    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    expect(mockContext.navigate).not.toHaveBeenCalled();
    expect(result.success).toBe(true);

    openSpy.mockRestore();
  });

  it('should handle http URLs as external', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const action = { type: 'navigate' as const, url: 'http://example.com' };
    const result = await handleNavigate(action, mockContext);

    expect(openSpy).toHaveBeenCalledWith('http://example.com', '_blank', 'noopener,noreferrer');
    expect(result.success).toBe(true);

    openSpy.mockRestore();
  });

  it('should return error for non-string URLs', async () => {
    const action = { type: 'navigate' as const, url: 123 as any };
    const result = await handleNavigate(action, mockContext);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Navigate action requires a string URL');
  });
});
