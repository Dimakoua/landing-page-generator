import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import LayoutResolver from '@/engine/LayoutResolver';
import type { Layout } from '@/schemas';

// Mock EngineRenderer
vi.mock('@/engine/EngineRenderer', () => ({
  default: vi.fn(() => <div data-testid="engine-renderer">Rendered</div>)
}));

// Mock react-responsive
vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn()
}));

import { useMediaQuery } from 'react-responsive';
import EngineRenderer from '@/engine/EngineRenderer';

describe('LayoutResolver', () => {
  const desktopLayout: Layout = {
    sections: [
      { component: 'Hero', props: { title: 'Desktop Hero' } },
      { component: 'Features', props: { items: [] } }
    ]
  };

  const mobileLayout: Layout = {
    sections: [
      { component: 'Hero', props: { title: 'Mobile Hero' } }
    ]
  };

  const layouts = { desktop: desktopLayout, mobile: mobileLayout };
  const actionContext = { formData: {}, getState: vi.fn(), setState: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render desktop layout when screen width >= 769px', () => {
    (useMediaQuery as any).mockReturnValue(true); // isDesktop = true

    render(<LayoutResolver layouts={layouts} actionContext={actionContext} slug="test" />);

    expect(EngineRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: desktopLayout,
        actionContext,
        slug: 'test',
        variant: undefined
      }),
      undefined
    );
  });

  it('should render mobile layout when screen width < 769px', () => {
    (useMediaQuery as any).mockReturnValue(false); // isDesktop = false

    render(<LayoutResolver layouts={layouts} actionContext={actionContext} slug="test" />);

    expect(EngineRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: mobileLayout,
        actionContext,
        slug: 'test',
        variant: undefined
      }),
      undefined
    );
  });

  it('should pass variant prop to EngineRenderer', () => {
    (useMediaQuery as any).mockReturnValue(true);

    render(<LayoutResolver layouts={layouts} actionContext={actionContext} slug="test" variant="A" />);

    expect(EngineRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: desktopLayout,
        actionContext,
        slug: 'test',
        variant: 'A'
      }),
      undefined
    );
  });

  it('should handle undefined actionContext', () => {
    (useMediaQuery as any).mockReturnValue(true);

    render(<LayoutResolver layouts={layouts} slug="test" />);

    expect(EngineRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: desktopLayout,
        slug: 'test',
        variant: undefined,
        actionContext: undefined
      }),
      undefined
    );
  });

  it('should re-render when media query changes', () => {
    const { rerender } = render(<LayoutResolver layouts={layouts} actionContext={actionContext} slug="test" />);

    // Start with desktop
    (useMediaQuery as any).mockReturnValue(true);
    rerender(<LayoutResolver layouts={layouts} actionContext={actionContext} slug="test" />);

    expect(EngineRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: desktopLayout,
        actionContext,
        slug: 'test',
        variant: undefined
      }),
      undefined
    );

    // Switch to mobile
    (useMediaQuery as any).mockReturnValue(false);
    rerender(<LayoutResolver layouts={layouts} actionContext={actionContext} slug="test" />);

    expect(EngineRenderer).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: mobileLayout,
        actionContext,
        slug: 'test',
        variant: undefined
      }),
      undefined
    );
  });
});
