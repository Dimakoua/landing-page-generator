import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleClosePopup } from '@/engine/actions/ClosePopupAction';
import type { ActionContext } from '@/schemas/actions';

describe('ClosePopupAction', () => {
  let mockContext: ActionContext;

  beforeEach(() => {
    mockContext = {
      navigate: vi.fn(),
      getState: vi.fn(),
      setState: vi.fn(),
      formData: {},
      closePopup: vi.fn(),
    } as any;
  });

  it('should call context.closePopup when available', async () => {
    const action = { type: 'closePopup' as const };

    const result = await handleClosePopup(action, mockContext);

    expect(mockContext.closePopup).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should return error when closePopup not available in context', async () => {
    const contextWithoutClosePopup: ActionContext = {
      navigate: vi.fn(),
      getState: vi.fn(),
      setState: vi.fn(),
      formData: {},
    } as any;

    const action = { type: 'closePopup' as const };
    const result = await handleClosePopup(action, contextWithoutClosePopup);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('closePopup not available in context');
  });

  it('should handle closePopup errors', async () => {
    const error = new Error('Close failed');
    mockContext.closePopup = vi.fn().mockImplementation(() => {
      throw error;
    });

    const action = { type: 'closePopup' as const };
    const result = await handleClosePopup(action, mockContext);

    expect(result.success).toBe(false);
    expect(result.error).toEqual(error);
  });
});
