import { useEffect } from 'react';

import type { Theme } from '../schemas';

interface ThemeInjectorProps {
  theme: Theme;
}

export function ThemeInjector({ theme }: ThemeInjectorProps) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement.style;

    Object.entries(theme.colors ?? {}).forEach(([key, value]) => {
      root.setProperty(`--color-${key}`, value);
    });

    Object.entries(theme.fonts ?? {}).forEach(([key, value]) => {
      root.setProperty(`--font-${key}`, value);
    });

    Object.entries(theme.spacing ?? {}).forEach(([key, value]) => {
      root.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(theme.radius ?? {}).forEach(([key, value]) => {
      root.setProperty(`--radius-${key}`, value);
    });
  }, [theme]);

  return null;
}
