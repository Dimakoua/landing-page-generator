import { useState } from 'react';
import { logger } from '../../utils/logger';
import secureSession from '../../utils/secureSession';

export function useVariant(slug: string) {
  // Determine initial variant synchronously during render to avoid
  // calling setState inside an effect (avoids cascading renders).
  const getInitial = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const variantFromUrl = urlParams.get('variant');
      if (variantFromUrl) return variantFromUrl;

      const stored = secureSession.getItem(`ab_variant_${slug}`);
      if (stored) return stored;

      const randomVariant = Math.random() < 0.5 ? 'A' : 'B';
      try {
        secureSession.setItem(`ab_variant_${slug}`, randomVariant);
      } catch (err) {
        logger.error('Failed to set sessionStorage for variant', err);
      }
      return randomVariant;
    } catch (err) {
      logger.error('Failed to determine variant, falling back to A', err);
      // Fallback if accessing window/sessionStorage fails (e.g. SSR)
      return 'A';
    }
  };

  const [variant] = useState<string | undefined>(() => getInitial());
  return variant;
}
