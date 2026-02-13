import { useEffect, useState } from 'react';
import type { Layout } from '../../schemas';
import { getStepLayouts } from '../ProjectResolver';
import { logger } from '../../utils/logger';

/**
 * Loads step-specific layout when StepContent is present
 */
export function useStepLayout(
  shouldLoad: boolean,
  slug: string,
  stepId?: string,
  variant?: string
) {
  const [stepLayout, setStepLayout] = useState<Layout | null>(null);
  const [stepLayoutError, setStepLayoutError] = useState<Error | null>(null);

  useEffect(() => {
    if (!shouldLoad || !stepId) return;

    const loadStepLayout = async () => {
      try {
        logger.debug(`[useStepLayout] Loading step layout for: ${stepId}`);
        const stepLayoutData = await getStepLayouts(slug, stepId, variant);
        setStepLayout(stepLayoutData.desktop);
        setStepLayoutError(null);
      } catch (err) {
        logger.error(`[useStepLayout] Failed to load step layout for ${stepId}:`, err);
        setStepLayoutError(err as Error);
      }
    };

    loadStepLayout();
  }, [shouldLoad, slug, stepId, variant]);

  return { stepLayout, stepLayoutError };
}
