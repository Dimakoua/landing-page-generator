import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ThemeInjector from '@/engine/ThemeInjector';
import type { Theme } from '@/schemas';

// Mock document.documentElement.style
const mockSetProperty = vi.fn();
const mockGetPropertyValue = vi.fn();

Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      setProperty: mockSetProperty,
      getPropertyValue: mockGetPropertyValue,
    },
  },
  writable: true,
});

describe('ThemeInjector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any CSS variables that might have been set
    mockSetProperty.mockClear();
  });

  it('should render null (side-effect only component)', () => {
    const theme: Theme = { colors: { primary: '#000' } };

    const { container } = render(<ThemeInjector theme={theme} />);

    expect(container.firstChild).toBeNull();
  });

  describe('color variables', () => {
    it('should inject color variables with correct CSS custom property names', () => {
      const theme: Theme = {
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          accent: '#28a745'
        }
      };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).toHaveBeenCalledWith('--color-primary', '#007bff');
      expect(mockSetProperty).toHaveBeenCalledWith('--color-secondary', '#6c757d');
      expect(mockSetProperty).toHaveBeenCalledWith('--color-accent', '#28a745');
    });

    it('should handle empty colors object', () => {
      const theme: Theme = { colors: {} };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).not.toHaveBeenCalled();
    });

    it('should handle undefined colors', () => {
      const theme: Theme = {};

      render(<ThemeInjector theme={theme} />);

      // Should not throw and should not call setProperty for colors
      expect(mockSetProperty).not.toHaveBeenCalled();
    });
  });

  describe('font variables', () => {
    it('should inject font variables with correct CSS custom property names', () => {
      const theme: Theme = {
        fonts: {
          body: 'Arial, sans-serif',
          heading: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          mono: 'Monaco, "Bitstream Vera Sans Mono", monospace'
        }
      };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).toHaveBeenCalledWith('--font-body', 'Arial, sans-serif');
      expect(mockSetProperty).toHaveBeenCalledWith('--font-heading', '"Helvetica Neue", Helvetica, Arial, sans-serif');
      expect(mockSetProperty).toHaveBeenCalledWith('--font-mono', 'Monaco, "Bitstream Vera Sans Mono", monospace');
    });

    it('should handle empty fonts object', () => {
      const theme: Theme = { fonts: {} };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).not.toHaveBeenCalled();
    });

    it('should handle undefined fonts', () => {
      const theme: Theme = {};

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).not.toHaveBeenCalled();
    });
  });

  describe('spacing variables', () => {
    it('should inject spacing variables with correct CSS custom property names', () => {
      const theme: Theme = {
        spacing: {
          small: '8px',
          medium: '16px',
          large: '24px',
          xl: '32px'
        }
      };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).toHaveBeenCalledWith('--spacing-small', '8px');
      expect(mockSetProperty).toHaveBeenCalledWith('--spacing-medium', '16px');
      expect(mockSetProperty).toHaveBeenCalledWith('--spacing-large', '24px');
      expect(mockSetProperty).toHaveBeenCalledWith('--spacing-xl', '32px');
    });

    it('should handle empty spacing object', () => {
      const theme: Theme = { spacing: {} };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).not.toHaveBeenCalled();
    });

    it('should handle undefined spacing', () => {
      const theme: Theme = {};

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).not.toHaveBeenCalled();
    });
  });

  describe('radius variables', () => {
    it('should inject radius variables with correct CSS custom property names', () => {
      const theme: Theme = {
        radius: {
          small: '4px',
          medium: '8px',
          large: '12px',
          round: '50%'
        }
      };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).toHaveBeenCalledWith('--radius-small', '4px');
      expect(mockSetProperty).toHaveBeenCalledWith('--radius-medium', '8px');
      expect(mockSetProperty).toHaveBeenCalledWith('--radius-large', '12px');
      expect(mockSetProperty).toHaveBeenCalledWith('--radius-round', '50%');
    });

    it('should handle empty radius object', () => {
      const theme: Theme = { radius: {} };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).not.toHaveBeenCalled();
    });

    it('should handle undefined radius', () => {
      const theme: Theme = {};

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).not.toHaveBeenCalled();
    });
  });

  describe('complete theme', () => {
    it('should inject all theme variables when all properties are provided', () => {
      const theme: Theme = {
        colors: {
          primary: '#007bff',
          secondary: '#6c757d'
        },
        fonts: {
          body: 'Arial, sans-serif',
          heading: 'Helvetica, sans-serif'
        },
        spacing: {
          small: '8px',
          large: '24px'
        },
        radius: {
          small: '4px',
          large: '12px'
        }
      };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).toHaveBeenCalledTimes(8);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-primary', '#007bff');
      expect(mockSetProperty).toHaveBeenCalledWith('--color-secondary', '#6c757d');
      expect(mockSetProperty).toHaveBeenCalledWith('--font-body', 'Arial, sans-serif');
      expect(mockSetProperty).toHaveBeenCalledWith('--font-heading', 'Helvetica, sans-serif');
      expect(mockSetProperty).toHaveBeenCalledWith('--spacing-small', '8px');
      expect(mockSetProperty).toHaveBeenCalledWith('--spacing-large', '24px');
      expect(mockSetProperty).toHaveBeenCalledWith('--radius-small', '4px');
      expect(mockSetProperty).toHaveBeenCalledWith('--radius-large', '12px');
    });
  });

  describe('theme updates', () => {
    it('should update CSS variables when theme prop changes', () => {
      const initialTheme: Theme = { colors: { primary: '#000' } };
      const updatedTheme: Theme = { colors: { primary: '#fff' } };

      const { rerender } = render(<ThemeInjector theme={initialTheme} />);

      expect(mockSetProperty).toHaveBeenCalledWith('--color-primary', '#000');

      // Clear mock to check next call
      mockSetProperty.mockClear();

      rerender(<ThemeInjector theme={updatedTheme} />);

      expect(mockSetProperty).toHaveBeenCalledWith('--color-primary', '#fff');
    });

    it('should handle theme prop changing from undefined to defined', () => {
      const { rerender } = render(<ThemeInjector theme={{}} />);

      expect(mockSetProperty).not.toHaveBeenCalled();

      const themeWithColors: Theme = { colors: { primary: '#000' } };
      rerender(<ThemeInjector theme={themeWithColors} />);

      expect(mockSetProperty).toHaveBeenCalledWith('--color-primary', '#000');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in values', () => {
      const theme: Theme = {
        colors: {
          special: '#007bff !important',
        },
        fonts: {
          fancy: '"Times New Roman", Times, serif',
        }
      };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).toHaveBeenCalledWith('--color-special', '#007bff !important');
      expect(mockSetProperty).toHaveBeenCalledWith('--font-fancy', '"Times New Roman", Times, serif');
    });

    it('should handle numeric values converted to strings', () => {
      const theme: Theme = {
        spacing: {
          zero: '0',
          ten: '10px',
        }
      };

      render(<ThemeInjector theme={theme} />);

      expect(mockSetProperty).toHaveBeenCalledWith('--spacing-zero', '0');
      expect(mockSetProperty).toHaveBeenCalledWith('--spacing-ten', '10px');
    });
  });
});
