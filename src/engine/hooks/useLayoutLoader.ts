import { useState, useEffect } from 'react';
import { getLayoutByPath, getStepLayouts } from '../ProjectResolver';
import { logger } from '../../utils/logger';
import type { Flow, Layout } from '../../schemas';

interface UseLayoutLoaderResult {
  layouts: { desktop: Layout; mobile: Layout } | null;
}

export function useLayoutLoader(
  slug: string,
  stepId: string | null,
  variant: string | undefined,
  config: { flows: { desktop: Flow; mobile: Flow } } | null,
  onError?: (error: Error) => void
): UseLayoutLoaderResult {
  const [layouts, setLayouts] = useState<{ desktop: Layout; mobile: Layout } | null>(null);

  useEffect(() => {
    if (!config || !stepId || !variant) {
      setLayouts(null);
      return;
    }

    const loadLayouts = async () => {
      try {
        logger.debug(`Loading layouts for step: ${stepId}, variant: ${variant}`);

        // Get step config from desktop flow (same for mobile for this logic)
        const stepConfig = config.flows.desktop.steps.find(s => s.id === stepId);
        if (!stepConfig) {
          throw new Error(`Step "${stepId}" not found in flow`);
        }

        // Check for explicit null - load from step folder
        if (stepConfig.layout === null) {
          logger.debug(`Layout null for step: ${stepId}, loading from step folder`);
          const layoutData = await getStepLayouts(slug, stepId, variant);
          setLayouts(layoutData);
          return;
        }

        // Determine layout path: step-specific override > global layout (required)
        const layoutPath = stepConfig.layout || config.flows.desktop.layout;

        if (!layoutPath) {
          throw new Error(`No layout specified for step "${stepId}". Define either a step-specific layout or a global flow layout.`);
        }

        logger.debug(`Loading layout: ${layoutPath} for step: ${stepId}`);
        const layoutData = await getLayoutByPath(slug, layoutPath, variant);

        setLayouts(layoutData);
      } catch (err) {
        logger.error(`Failed to load layouts for step: ${stepId}, variant: ${variant}`, err);
        setLayouts(null);
        onError?.(err as Error);
      }
    };

    loadLayouts();
  }, [slug, stepId, config, variant, onError]);

  return { layouts };
}