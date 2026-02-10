import React, { useEffect } from 'react';
import type { Theme } from '../schemas';

interface ThemeInjectorProps {
  theme: Theme;
}

const ThemeInjector: React.FC<ThemeInjectorProps> = ({ theme }) => {
  useEffect(() => {
    const root = document.documentElement.style;

    // Apply color variables
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.setProperty(`--color-${key}`, value);
      });
    }

    // Apply font variables
    if (theme.fonts) {
      Object.entries(theme.fonts).forEach(([key, value]) => {
        root.setProperty(`--font-${key}`, value);
      });
    }

    // Apply spacing variables
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.setProperty(`--spacing-${key}`, value);
      });
    }

    // Apply radius variables
    if (theme.radius) {
      Object.entries(theme.radius).forEach(([key, value]) => {
        root.setProperty(`--radius-${key}`, value);
      });
    }
  }, [theme]);

  return null; // Side-effect only component
};

export default ThemeInjector;