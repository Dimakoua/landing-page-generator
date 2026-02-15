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
    const onErrorAction: Action = { type: 'showError', message: 'Failed to load' };
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    render(<LoadFromApi {...defaultProps} onError={onErrorAction} />);

    await waitFor(() => {
      expect(mockDispatcher.dispatch).toHaveBeenCalledWith(onErrorAction);
    });
  });

  it('dispatches onError action when response is not ok', async () => {
    const onErrorAction: Action = { type: 'showError', message: 'Failed to load' };
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
    const onErrorAction: Action = { type: 'showError', message: 'Failed to load' };
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
    const { method, ...propsWithoutMethod } = defaultProps;
    render(<LoadFromApi {...propsWithoutMethod} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/test', { method: 'GET' });
    });
  });
});