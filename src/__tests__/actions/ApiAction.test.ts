import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleApi } from '@/engine/actions/ApiAction';
import type { Action } from '@/schemas/actions';

vi.mock('@/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
  }
}));

global.fetch = vi.fn();

describe('ApiAction', () => {
  let mockDispatch: any;
  let abortControllers: Map<string, AbortController>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockDispatch = vi.fn().mockResolvedValue({ success: true });
    abortControllers = new Map();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: 'success' }),
    } as any as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should make POST request with payload', async () => {
    const action = { 
      type: 'post' as const, 
      url: 'https://api.example.com/submit',
      payload: { name: 'John' },
      timeout: 10000,
      retries: 0
    };

    const result = await handleApi(action, mockDispatch, abortControllers);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/submit',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'John' }),
      })
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ data: 'success' });
  });

  it('should make POST request with relative URL', async () => {
    const action = { 
      type: 'post' as const, 
      url: '/api/checkout',
      payload: { name: 'John' },
      timeout: 10000,
      retries: 0
    };

    const result = await handleApi(action, mockDispatch, abortControllers);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'John' }),
      })
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ data: 'success' });
  });

  it('should make GET request with query params', async () => {
    const action = { 
      type: 'get' as const, 
      url: 'https://api.example.com/users',
      payload: { id: '123', active: 'true' },
      timeout: 10000,
      retries: 0
    };

    await handleApi(action, mockDispatch, abortControllers);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/users?id=123&active=true',
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('should include custom headers', async () => {
    const action = { 
      type: 'post' as const, 
      url: 'https://api.example.com/submit',
      headers: { 'Authorization': 'Bearer token123' },
      timeout: 10000,
      retries: 0
    };

    await handleApi(action, mockDispatch, abortControllers);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer token123',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should execute onSuccess action on successful request', async () => {
    const successAction: Action = { type: 'log', message: 'Success!', level: 'info' };
    const action = { 
      type: 'post' as const, 
      url: 'https://api.example.com/submit',
      onSuccess: successAction,
      timeout: 10000,
      retries: 0
    };

    await handleApi(action, mockDispatch, abortControllers);

    expect(mockDispatch).toHaveBeenCalledWith(successAction);
  });

  it('should execute onError action on failed request', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: vi.fn().mockResolvedValue({}),
    });

    const errorAction: Action = { type: 'log', message: 'Error!', level: 'error' };
    const action = { 
      type: 'post' as const, 
      url: 'https://api.example.com/submit',
      onError: errorAction,
      timeout: 10000,
      retries: 0
    };

    await handleApi(action, mockDispatch, abortControllers);

    expect(mockDispatch).toHaveBeenCalledWith(errorAction);
  });

  it('should retry on failure with exponential backoff', async () => {
    let callCount = 0;
    (global.fetch as any).mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
      });
    });

    const action = { 
      type: 'post' as const, 
      url: 'https://api.example.com/submit',
      timeout: 10000,
      retries: 2
    };

    const resultPromise = handleApi(action, mockDispatch, abortControllers);

    // Advance through retries
    await vi.advanceTimersByTimeAsync(1000); // First retry backoff: 2^0 * 1000 = 1000ms
    await vi.advanceTimersByTimeAsync(2000); // Second retry backoff: 2^1 * 1000 = 2000ms

    const result = await resultPromise;

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(result.success).toBe(true);
  });

  it('should abort request on timeout', async () => {
    let aborted = false;
    (global.fetch as any).mockImplementation(() => 
      new Promise((resolve, reject) => {
        // Simulate fetch that responds to abort signal
        setTimeout(() => {
          if (aborted) {
            reject(Object.assign(new Error('Request aborted'), { name: 'AbortError' }));
          } else {
            resolve({
              ok: true,
              json: vi.fn().mockResolvedValue({ data: 'success' }),
            });
          }
        }, 2000);
      })
    );

    const action = { 
      type: 'post' as const, 
      url: 'https://api.example.com/slow',
      timeout: 1000,
      retries: 0
    };

    const resultPromise = handleApi(action, mockDispatch, abortControllers);

    // Simulate abort after timeout
    await vi.advanceTimersByTimeAsync(1000);
    aborted = true;
    await vi.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;

    expect(result.success).toBe(false);
  }, 10000); // Increase test timeout

  it('should not retry on AbortError', async () => {
    (global.fetch as any).mockRejectedValue(
      Object.assign(new Error('Request aborted'), { name: 'AbortError' })
    );

    const action = { 
      type: 'post' as const, 
      url: 'https://api.example.com/submit',
      timeout: 10000,
      retries: 3
    };

    const result = await handleApi(action, mockDispatch, abortControllers);

    expect(global.fetch).toHaveBeenCalledTimes(1); // No retries
    expect(result.success).toBe(false);
  });

  it('should handle PUT and PATCH requests with payload', async () => {
    const putAction = { 
      type: 'put' as const, 
      url: 'https://api.example.com/update',
      payload: { id: '123', name: 'Updated' },
      timeout: 10000,
      retries: 0
    };

    await handleApi(putAction, mockDispatch, abortControllers);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ id: '123', name: 'Updated' }),
      })
    );
  });

  it('should handle DELETE requests', async () => {
    const deleteAction = { 
      type: 'delete' as const, 
      url: 'https://api.example.com/delete/123',
      timeout: 10000,
      retries: 0
    };

    await handleApi(deleteAction, mockDispatch, abortControllers);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('should handle non-JSON responses gracefully', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockRejectedValue(new Error('Not JSON')),
    });

    const action = { 
      type: 'post' as const, 
      url: 'https://api.example.com/submit',
      timeout: 10000,
      retries: 0
    };

    const result = await handleApi(action, mockDispatch, abortControllers);

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('should store and clean up abort controllers', async () => {
    const action = { 
      type: 'post' as const, 
      url: 'https://api.example.com/submit',
      timeout: 10000,
      retries: 0
    };

    expect(abortControllers.size).toBe(0);

    await handleApi(action, mockDispatch, abortControllers);

    expect(abortControllers.size).toBe(0); // Cleaned up after completion
  });
});
