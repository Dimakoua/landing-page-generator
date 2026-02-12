import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LandingPage from '@/engine/LandingPage';

// Mock all dependencies
vi.mock('@/engine/ProjectResolver', () => ({
  getProjectConfig: vi.fn(),
  getStepLayouts: vi.fn()
}));

vi.mock('@/engine/ThemeInjector', () => ({
  default: vi.fn(() => null)
}));

vi.mock('@/engine/LayoutResolver', () => ({
  default: vi.fn(() => <div data-testid="layout-resolver">Layout</div>)
}));

import { getProjectConfig, getStepLayouts } from '@/engine/ProjectResolver';
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

describe('LandingPage', () => {
  const mockTheme = { colors: { primary: '#000' } };
  const mockFlows = {
    desktop: { steps: [{ id: 'hero', type: 'normal' }] },
    mobile: { steps: [{ id: 'hero', type: 'normal' }] }
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
    (getStepLayouts as any).mockResolvedValue(mockLayouts);
    
    // Mock Math.random for predictable variant selection
    vi.spyOn(Math, 'random').mockReturnValue(0.3); // Will select 'A'
  });

  it('should render loading state initially', () => {
    render(<LandingPage slug="test" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should determine variant from URL parameter', async () => {
    mockLocation.search = '?variant=B';
    
    render(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(getProjectConfig).toHaveBeenCalledWith('test', 'B');
    });
  });

  it('should randomly assign variant when not in URL', async () => {
    render(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(getProjectConfig).toHaveBeenCalled();
    });

    // Check that variant was stored
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('ab_variant_test', 'A');
  });

  it('should load project config with determined variant', async () => {
    render(<LandingPage slug="test-page" />);

    await waitFor(() => {
      expect(getProjectConfig).toHaveBeenCalledWith('test-page', expect.any(String));
    });
  });

  it('should render ThemeInjector with loaded theme', async () => {
    render(<LandingPage slug="test" />);

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
    render(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(LayoutResolver).toHaveBeenCalled();
    });
  });

  it('should handle config loading error', async () => {
    const error = new Error('Failed to load config');
    (getProjectConfig as any).mockRejectedValue(error);

    render(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(screen.getByText(/Page Not Available/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load config/i)).toBeInTheDocument();
    });
  });

  it('should handle layouts loading error', async () => {
    const error = new Error('Failed to load layouts');
    (getStepLayouts as any).mockRejectedValue(error);

    render(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(screen.getByText(/Page Not Available/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to load layouts/i)).toBeInTheDocument();
    });
  });

  it('should use default step when no step in URL', async () => {
    render(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(getStepLayouts).toHaveBeenCalledWith('test', 'hero', expect.any(String));
    });
  });

  it('should use step from URL parameter', async () => {
    mockLocation.search = '?step=checkout&variant=A';
    
    const flowsWithCheckout = {
      desktop: { steps: [{ id: 'hero', type: 'normal' }, { id: 'checkout', type: 'normal' }] },
      mobile: { steps: [{ id: 'hero', type: 'normal' }, { id: 'checkout', type: 'normal' }] }
    };
    
    (getProjectConfig as any).mockResolvedValue({
      theme: mockTheme,
      flows: flowsWithCheckout
    });

    render(<LandingPage slug="test" />);

    await waitFor(() => {
      expect(getStepLayouts).toHaveBeenCalledWith('test', 'checkout', 'A');
    });
  });

  it('should pass variant to LayoutResolver', async () => {
    render(<LandingPage slug="test" />);

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
    render(<LandingPage slug="test" />);

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

  it('should handle popup steps separately', async () => {
    mockLocation.search = '?step=modal';
    
    const flowsWithPopup = {
      desktop: {
        steps: [
          { id: 'hero', type: 'normal' },
          { id: 'modal', type: 'popup' }
        ]
      },
      mobile: {
        steps: [
          { id: 'hero', type: 'normal' },
          { id: 'modal', type: 'popup' }
        ]
      }
    };
    
    (getProjectConfig as any).mockResolvedValue({
      theme: mockTheme,
      flows: flowsWithPopup
    });

    render(<LandingPage slug="test" />);

    await waitFor(() => {
      // Should load both base step and popup step
      expect(getStepLayouts).toHaveBeenCalled();
    });
  });
});
