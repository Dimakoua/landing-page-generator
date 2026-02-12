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
    };
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
});
