import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLayoutLoader } from '../../../src/engine/hooks/useLayoutLoader';

// Mock the dependencies
vi.mock('../../../src/engine/ProjectResolver', () => ({
  getLayoutByPath: vi.fn(),
  getStepLayouts: vi.fn(),
}));

vi.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import { getLayoutByPath, getStepLayouts } from '../../../src/engine/ProjectResolver';
import { logger } from '../../../src/utils/logger';

describe('useLayoutLoader', () => {
  const mockConfig = {
    flows: {
      desktop: {
        steps: [
          { id: 'home', layout: 'home-layout' },
          { id: 'about', layout: null },
        ],
        layout: 'default-layout',
      },
      mobile: {
        steps: [],
        layout: 'mobile-default',
      },
    },
  };

  const mockLayouts = {
    desktop: { components: [] },
    mobile: { components: [] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null layouts when config is null', () => {
    const { result } = renderHook(() =>
      useLayoutLoader('test-slug', 'home', 'A', null)
    );

    expect(result.current.layouts).toBeNull();
  });

  it('returns null layouts when stepId is null', () => {
    const { result } = renderHook(() =>
      useLayoutLoader('test-slug', null, 'A', mockConfig)
    );

    expect(result.current.layouts).toBeNull();
  });

  it('returns null layouts when variant is undefined', () => {
    const { result } = renderHook(() =>
      useLayoutLoader('test-slug', 'home', undefined, mockConfig)
    );

    expect(result.current.layouts).toBeNull();
  });

  it('loads layouts from step-specific layout path', async () => {
    (getLayoutByPath as any).mockResolvedValue(mockLayouts);

    const { result } = renderHook(() =>
      useLayoutLoader('test-slug', 'home', 'A', mockConfig)
    );

    await waitFor(() => {
      expect(result.current.layouts).toEqual(mockLayouts);
    });

    expect(getLayoutByPath).toHaveBeenCalledWith('test-slug', 'home-layout', 'A');
    expect(logger.debug).toHaveBeenCalledWith('Loading layout: home-layout for step: home');
  });

  it('loads layouts from step folder when layout is null', async () => {
    (getStepLayouts as any).mockResolvedValue(mockLayouts);

    const { result } = renderHook(() =>
      useLayoutLoader('test-slug', 'about', 'A', mockConfig)
    );

    await waitFor(() => {
      expect(result.current.layouts).toEqual(mockLayouts);
    });

    expect(getStepLayouts).toHaveBeenCalledWith('test-slug', 'about', 'A');
    expect(logger.debug).toHaveBeenCalledWith('Layout null for step: about, loading from step folder');
  });

  it('falls back to global layout when step has no layout', async () => {
    const configWithGlobal = {
      ...mockConfig,
      flows: {
        ...mockConfig.flows,
        desktop: {
          ...mockConfig.flows.desktop,
          steps: [{ id: 'contact', layout: undefined }],
        },
      },
    };

    (getLayoutByPath as any).mockResolvedValue(mockLayouts);

    const { result } = renderHook(() =>
      useLayoutLoader('test-slug', 'contact', 'A', configWithGlobal)
    );

    await waitFor(() => {
      expect(result.current.layouts).toEqual(mockLayouts);
    });

    expect(getLayoutByPath).toHaveBeenCalledWith('test-slug', 'default-layout', 'A');
  });

  it('sets layouts to null on error', async () => {
    (getLayoutByPath as any).mockRejectedValue(new Error('Load failed'));

    const { result } = renderHook(() =>
      useLayoutLoader('test-slug', 'home', 'A', mockConfig)
    );

    await waitFor(() => {
      expect(result.current.layouts).toBeNull();
    });

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to load layouts for step: home, variant: A',
      expect.any(Error)
    );
  });

  it('throws error when step not found in flow', async () => {
    const { result } = renderHook(() =>
      useLayoutLoader('test-slug', 'nonexistent', 'A', mockConfig)
    );

    await waitFor(() => {
      expect(result.current.layouts).toBeNull();
    });

    expect(logger.error).toHaveBeenCalledWith(
      'Failed to load layouts for step: nonexistent, variant: A',
      expect.any(Error)
    );
  });
});