import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LoadFromApi from '@/components/fetchfromapi/LoadFromApi';
import { renderSection } from '@/engine/utils/renderSection';
import type { Action } from '@/schemas/actions';

// Mock renderSection
vi.mock('@/engine/utils/renderSection', () => ({
  renderSection: vi.fn(),
}));

// Mock useInterpolation hook
vi.mock('@/engine/hooks/useInterpolation', () => ({
  useInterpolation: () => ({
    interpolateObject: vi.fn((obj) => obj),
  }),
}));

// Mock global fetch
global.fetch = vi.fn();

describe('LoadFromApi Component', () => {
  const mockDispatcher = {
    dispatch: vi.fn().mockResolvedValue({ success: true }),
  } as any;

  const defaultProps = {
    endpoint: '/api/test',
    method: 'GET' as const,
    dispatcher: mockDispatcher,
    state: {},
    slug: 'test-slug',
    stepId: 'step-1',
    variant: 'desktop',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        sections: [
          { component: 'Hero', props: { title: 'Test Hero' } },
          { component: 'Cart', props: { title: 'Test Cart' } },
        ],
      }),
    } as any as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading state initially', () => {
    render(<LoadFromApi {...defaultProps} />);
    expect(screen.getByText('Loading components...')).toBeInTheDocument();
  });

  it('fetches data from the correct endpoint with correct method', async () => {
    render(<LoadFromApi {...defaultProps} method="POST" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/test', { method: 'POST' });
    });
  });

  it('renders sections when fetch is successful', async () => {
    const mockRenderSection = vi.mocked(renderSection);
    mockRenderSection.mockImplementation(({ index }) => <div key={index}>Rendered Section {index}</div>);

    render(<LoadFromApi {...defaultProps} />);

    await waitFor(() => {
      expect(mockRenderSection).toHaveBeenCalledTimes(2);
    });

    expect(mockRenderSection).toHaveBeenCalledWith({
      section: { component: 'Hero', props: { title: 'Test Hero' } },
      index: 0,
      interpolateObject: expect.any(Function),
      engineState: {},
      dispatcher: mockDispatcher,
      slug: 'test-slug',
      stepId: 'step-1',
      variant: 'desktop',
    });

    expect(mockRenderSection).toHaveBeenCalledWith({
      section: { component: 'Cart', props: { title: 'Test Cart' } },
      index: 1,
      interpolateObject: expect.any(Function),
      engineState: {},
      dispatcher: mockDispatcher,
      slug: 'test-slug',
      stepId: 'step-1',
      variant: 'desktop',
    });

    expect(screen.getByText('Rendered Section 0')).toBeInTheDocument();
    expect(screen.getByText('Rendered Section 1')).toBeInTheDocument();
  });

  it('dispatches onError action when fetch fails', async () => {
    const onErrorAction: Action = { type: 'log', message: 'Failed to load' };
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    render(<LoadFromApi {...defaultProps} onError={onErrorAction} />);

    await waitFor(() => {
      expect(mockDispatcher.dispatch).toHaveBeenCalledWith(onErrorAction);
    });
  });

  it('dispatches onError action when response is not ok', async () => {
    const onErrorAction: Action = { type: 'log', message: 'Failed to load' };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn(),
    } as any as Response);

    render(<LoadFromApi {...defaultProps} onError={onErrorAction} />);

    await waitFor(() => {
      expect(mockDispatcher.dispatch).toHaveBeenCalledWith(onErrorAction);
    });
  });

  it('dispatches onError action when response format is invalid', async () => {
    const onErrorAction: Action = { type: 'log', message: 'Failed to load' };
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ invalid: 'format' }), // Missing sections array
    } as any as Response);

    render(<LoadFromApi {...defaultProps} onError={onErrorAction} />);

    await waitFor(() => {
      expect(mockDispatcher.dispatch).toHaveBeenCalledWith(onErrorAction);
    });
  });

  it('does not dispatch onError when no onError action is provided', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    render(<LoadFromApi {...defaultProps} />);

    await waitFor(() => {
      expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });
  });

  it('handles empty sections array', async () => {
    const mockRenderSection = vi.mocked(renderSection);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ sections: [] }),
    } as any as Response);

    render(<LoadFromApi {...defaultProps} />);

    await waitFor(() => {
      expect(mockRenderSection).not.toHaveBeenCalled();
    });

    // Should not show loading anymore
    expect(screen.queryByText('Loading components...')).not.toBeInTheDocument();
  });

  it('defaults to GET method when no method is provided', async () => {
    const propsWithoutMethod = { ...defaultProps } as any;
    delete propsWithoutMethod.method;
    render(<LoadFromApi {...propsWithoutMethod} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/test', { method: 'GET' });
    });
  });

  describe('Caching functionality', () => {
    beforeEach(() => {
      // Clear sessionStorage mock (Storage.prototype spies apply to sessionStorage)
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    });

    it('fetches from API when cache is disabled', async () => {
      render(<LoadFromApi {...defaultProps} cacheEnabled={false} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/test', { method: 'GET' });
      });
    });

    it('uses cached data when available and valid', async () => {
      const cachedData = {
        sections: [
          { component: 'Hero', props: { title: 'Cached Hero' } }
        ]
      };
      const cacheEntry = {
        data: cachedData,
        timestamp: Date.now(),
        ttl: 300000, // 5 minutes
      };

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(cacheEntry));

      render(<LoadFromApi {...defaultProps} cacheEnabled={true} />);

      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      });

      expect(screen.getByText('Rendered Section 0')).toBeInTheDocument();
    });

    it('fetches from API when cache is expired', async () => {
      const cachedData = {
        sections: [
          { component: 'Hero', props: { title: 'Expired Hero' } }
        ]
      };
      const cacheEntry = {
        data: cachedData,
        timestamp: Date.now() - 400000, // 400 seconds ago (expired)
        ttl: 300000, // 5 minutes
      };

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(cacheEntry));

      render(<LoadFromApi {...defaultProps} cacheEnabled={true} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/test', { method: 'GET' });
      });
    });

    it('caches successful API response', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      render(<LoadFromApi {...defaultProps} cacheEnabled={true} ttl={60000} />);

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalled();
      });

      const [cacheKey, cacheValue] = setItemSpy.mock.calls[0];
      expect(cacheKey).toContain('lp_factory_api_'); // Auto-generated key prefix
      expect(cacheKey).toContain('_GET'); // Method suffix
      const parsedValue = JSON.parse(cacheValue);
      expect(parsedValue.data.sections).toEqual([
        { component: 'Hero', props: { title: 'Test Hero' } },
        { component: 'Cart', props: { title: 'Test Cart' } }
      ]);
      expect(parsedValue.ttl).toBe(60000);
    });

    it('uses custom cache key when provided', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      render(<LoadFromApi {...defaultProps} cacheEnabled={true} cacheKey="custom_key" />);

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalled();
      });

      const [cacheKey] = setItemSpy.mock.calls[0];
      expect(cacheKey).toBe('custom_key');
    });

    it('handles sessionStorage errors gracefully', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should still fetch from API despite cache error
      render(<LoadFromApi {...defaultProps} cacheEnabled={true} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/test', { method: 'GET' });
      });
    });

    it('removes expired cache entries', async () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      const expiredEntry = {
        data: { sections: [] },
        timestamp: Date.now() - 400000,
        ttl: 300000,
      };

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(expiredEntry));

      render(<LoadFromApi {...defaultProps} cacheEnabled={true} />);

      await waitFor(() => {
        expect(removeItemSpy).toHaveBeenCalled();
      });
    });
  });
});