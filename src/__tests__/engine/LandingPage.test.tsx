import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from '@/engine/LandingPage';
import type { ReactElement } from 'react';

// Mock all dependencies
vi.mock('@/engine/ProjectResolver', () => ({
  getProjectConfig: vi.fn(),
  getLayoutByPath: vi.fn(),
  getStepLayouts: vi.fn()
}));

vi.mock('@/engine/ThemeInjector', () => ({
  default: vi.fn(() => null)
}));

vi.mock('@/engine/LayoutResolver', () => ({
  default: vi.fn(() => <div data-testid="layout-resolver">Layout</div>)
}));

import { getProjectConfig, getLayoutByPath, getStepLayouts } from '@/engine/ProjectResolver';
import ThemeInjector from '@/engine/ThemeInjector';
import LayoutResolver from '@/engine/LayoutResolver';

// Mock window.location
const mockLocation = {
  href: 'http://localhost/',
  search: '',
  pathname: '/'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Helper to render with HelmetProvider
const renderWithHelmet = (ui: ReactElement) => {
  return render(
    <HelmetProvider>
      {ui}
    </HelmetProvider>
  );
};

describe('LandingPage', () => {
  const mockTheme = { colors: { primary: '#000' } };
  const mockFlows = {
    desktop: { layout: 'layouts/main', steps: [{ id: 'hero', type: 'normal' }] },
    mobile: { layout: 'layouts/main', steps: [{ id: 'hero', type: 'normal' }] }
  };
  const mockLayouts = {
    desktop: { sections: [{ component: 'Hero', props: {} }] },
    mobile: { sections: [{ component: 'Hero', props: {} }] }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
    mockLocation.search = '';
    
    // Default mock implementations
    (getProjectConfig as any).mockResolvedValue({
      theme: mockTheme,
      flows: mockFlows
    });
    (getLayoutByPath as any).mockResolvedValue(mockLayouts);
    (getStepLayouts as any).mockResolvedValue(mockLayouts);
    
    // Mock Math.random for predictable variant selection
    vi.spyOn(Math, 'random').mockReturnValue(0.3); // Will select 'A'
  });

  it('should render loading state initially', () => {
    renderWithHelmet(<LandingPage slug="test" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should determine variant from URL parameter', async () => {
    mockLocation.search = '?variant=B';
    
    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(getProjectConfig).toHaveBeenCalledWith('test', 'B');
    });
  });

  it('should randomly assign variant when not in URL', async () => {
    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(getProjectConfig).toHaveBeenCalled();
    });

    // Check that variant was stored (decrypt stored value before asserting)
    const stored = sessionStorageMock.getItem('ab_variant_test') as string;
    const fp = sessionStorageMock.getItem('__ufp') as string | undefined;
    // decrypt imported from secureSession
    const { decryptString } = await import('@/utils/secureSession');
    const decoded = stored && stored.startsWith('enc:') ? decryptString(stored, fp) : stored;
    expect(decoded).toBe('A');
  });

  it('should load project config with determined variant', async () => {
    renderWithHelmet(<LandingPage slug="test-page" />);

    await waitFor(() => {
      expect(getProjectConfig).toHaveBeenCalledWith('test-page', expect.any(String));
    });
  });

  it('should render ThemeInjector with loaded theme', async () => {
    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(ThemeInjector).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: mockTheme
        }),
        undefined
      );
    });
  });

  it('should render LayoutResolver with layouts', async () => {
    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(LayoutResolver).toHaveBeenCalled();
    });
  });

  it('should handle config loading error', async () => {
    const error = new Error('Failed to load config');
    (getProjectConfig as any).mockRejectedValue(error);

    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(screen.getByText(/Page Not Available/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load config/i)).toBeInTheDocument();
    });
  });

  it('should handle layouts loading error', async () => {
    const error = new Error('Failed to load layouts');
    (getLayoutByPath as any).mockRejectedValue(error);

    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(screen.getByText(/Page Not Available/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load layouts/i)).toBeInTheDocument();
    });
  });

  it('should load main layout from flow', async () => {
    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(getLayoutByPath).toHaveBeenCalledWith('test', 'layouts/main', expect.any(String));
    });
  });

  it('should use step-specific layout override when available', async () => {
    mockLocation.search = '?step=checkout&variant=A';
    
    const flowsWithCheckout = {
      desktop: { layout: 'layouts/main', steps: [{ id: 'hero', type: 'normal' }, { id: 'checkout', type: 'normal', layout: 'layouts/checkout' }] },
      mobile: { layout: 'layouts/main', steps: [{ id: 'hero', type: 'normal' }, { id: 'checkout', type: 'normal', layout: 'layouts/checkout' }] }
    };
    
    (getProjectConfig as any).mockResolvedValue({
      theme: mockTheme,
      flows: flowsWithCheckout
    });

    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(getLayoutByPath).toHaveBeenCalledWith('test', 'layouts/checkout', 'A');
    });
  });

  it('should load from step folder when layout is null', async () => {
    mockLocation.search = '?step=cart&variant=A';
    
    const flowsWithNull = {
      desktop: { layout: 'layouts/main', steps: [{ id: 'hero', type: 'normal' }, { id: 'cart', type: 'popup', layout: null }] },
      mobile: { layout: 'layouts/main', steps: [{ id: 'hero', type: 'normal' }, { id: 'cart', type: 'popup', layout: null }] }
    };
    
    (getProjectConfig as any).mockResolvedValue({
      theme: mockTheme,
      flows: flowsWithNull
    });

    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      // Should load from step folder for the popup with null layout
      expect(getStepLayouts).toHaveBeenCalledWith('test', 'cart', 'A');
    });
  });

  it('should pass variant to LayoutResolver', async () => {
    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(LayoutResolver).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: expect.any(String),
          layouts: mockLayouts,
          slug: 'test',
          actionContext: expect.any(Object)
        }),
        undefined
      );
    });
  });

  it('should pass actionContext with navigate function to LayoutResolver', async () => {
    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(LayoutResolver).toHaveBeenCalledWith(
        expect.objectContaining({
          actionContext: expect.objectContaining({
            navigate: expect.any(Function)
          }),
          layouts: mockLayouts,
          slug: 'test',
          variant: expect.any(String)
        }),
        undefined
      );
    });
  });

  it('should handle missing layout gracefully', async () => {
    const flowsNoLayout = {
      desktop: { steps: [{ id: 'hero', type: 'normal' }] },
      mobile: { steps: [{ id: 'hero', type: 'normal' }] }
    };
    
    (getProjectConfig as any).mockResolvedValue({
      theme: mockTheme,
      flows: flowsNoLayout
    });

    renderWithHelmet(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(screen.getByText(/Page Not Available/i)).toBeInTheDocument();
      expect(screen.getByText(/No layout specified/i)).toBeInTheDocument();
    });
  });
});
