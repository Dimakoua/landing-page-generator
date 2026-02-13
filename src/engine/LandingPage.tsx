import React, { Suspense, useState, useEffect } from 'react';
import { getProjectConfig, getLayoutByPath, getStepLayouts } from './ProjectResolver';
import ThemeInjector from './ThemeInjector';
import LayoutResolver from './LayoutResolver';
import PopupOverlay from './PopupOverlay';
import { useVariant } from './hooks/useVariant';
import { useStepNavigation } from './hooks/useStepNavigation';
import { logger } from '../utils/logger';
import type { Theme, Flow, Layout } from '../schemas';

interface LandingPageProps {
  slug: string;
}

/**
 * LandingPage - Main landing page renderer
 * Loads configuration by slug and renders the current step's layout
 */
const LandingPage: React.FC<LandingPageProps> = ({ slug }) => {
  const [config, setConfig] = useState<{ theme: Theme; flows: { desktop: Flow; mobile: Flow } } | null>(null);
  const [baseLayouts, setBaseLayouts] = useState<{ desktop: Layout; mobile: Layout } | null>(null);
  const [popupLayouts, setPopupLayouts] = useState<{ desktop: Layout; mobile: Layout } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // refactored hooks for clarity
  const variant = useVariant(slug);
  const { baseStepId, popupStepId, initializeFromConfig, navigate: stepNavigate, closePopup } = useStepNavigation(slug);

  // variant is derived from hook (URL → sessionStorage → random)
  // `useVariant` returns undefined until it determines the variant
  // (LandingPage will wait for `variant` before loading config).

  useEffect(() => {
    const loadConfig = async () => {
      if (!variant) return; // Wait for variant to be determined
      try {
        logger.debug(`Loading config for slug: ${slug}, variant: ${variant}`);
        const configData = await getProjectConfig(slug, variant);
        setConfig(configData);
      } catch (err) {
        logger.error(`Failed to load config for slug: ${slug}, variant: ${variant}`, err);
        setError(err as Error);
      }
    };

    loadConfig();
  }, [slug, variant]);

  // initialize navigation state (base / popup) from loaded config
  useEffect(() => {
    if (config) {
      initializeFromConfig(config.flows);
    }
  }, [config, initializeFromConfig]);

  // popstate handling is delegated to `useStepNavigation` (keeps LandingPage focused on orchestration)

  // navigation functions are provided by useStepNavigation (stepNavigate, closePopup)
  const navigate = (stepId: string) => stepNavigate(stepId);


  // Load base step layouts
  useEffect(() => {
    if (config && baseStepId) {
      const loadLayouts = async () => {
        try {
          logger.debug(`Loading base layouts for step: ${baseStepId}, variant: ${variant}`);
          
          // Get step config from desktop flow (same for mobile for this logic)
          const stepConfig = config.flows.desktop.steps.find(s => s.id === baseStepId);
          if (!stepConfig) {
            throw new Error(`Step "${baseStepId}" not found in flow`);
          }
          
          // Check for explicit null - load from step folder
          if (stepConfig.layout === null) {
            logger.debug(`Layout null for step: ${baseStepId}, loading from step folder`);
            const layoutData = await getStepLayouts(slug, baseStepId, variant);
            setBaseLayouts(layoutData);
            return;
          }
          
          // Determine layout path: step-specific override > global layout (required)
          const layoutPath = stepConfig.layout || config.flows.desktop.layout;
          
          if (!layoutPath) {
            throw new Error(`No layout specified for step "${baseStepId}". Define either a step-specific layout or a global flow layout.`);
          }
          
          logger.debug(`Loading layout: ${layoutPath} for step: ${baseStepId}`);
          const layoutData = await getLayoutByPath(slug, layoutPath, variant);
          
          setBaseLayouts(layoutData);
        } catch (err) {
          logger.error(`Failed to load base layouts for step: ${baseStepId}, variant: ${variant}`, err);
          setError(err as Error);
        }
      };

      loadLayouts();
    }
  }, [slug, baseStepId, config, variant]);
  
  // Load popup step layouts
  useEffect(() => {
    if (config && popupStepId) {
      const loadLayouts = async () => {
        try {
          logger.debug(`Loading popup layouts for step: ${popupStepId}, variant: ${variant}`);
          
          // Get step config from desktop flow
          const stepConfig = config.flows.desktop.steps.find(s => s.id === popupStepId);
          if (!stepConfig) {
            throw new Error(`Step "${popupStepId}" not found in flow`);
          }
          
          // Check for explicit null - load from step folder
          if (stepConfig.layout === null) {
            logger.debug(`Layout null for popup step: ${popupStepId}, loading from step folder`);
            const layoutData = await getStepLayouts(slug, popupStepId, variant);
            setPopupLayouts(layoutData);
            return;
          }
          
          // Determine layout path: step-specific override > global layout (required)
          const layoutPath = stepConfig.layout || config.flows.desktop.layout;
          
          if (!layoutPath) {
            throw new Error(`No layout specified for popup step "${popupStepId}". Define either a step-specific layout or a global flow layout.`);
          }
          
          logger.debug(`Loading popup layout: ${layoutPath} for step: ${popupStepId}`);
          const layoutData = await getLayoutByPath(slug, layoutPath, variant);
          
          setPopupLayouts(layoutData);
        } catch (err) {
          logger.error(`Failed to load popup layouts for step: ${popupStepId}, variant: ${variant}`, err);
          setError(err as Error);
        }
      };

      loadLayouts();
    }
  }, [slug, popupStepId, config, variant]);

  if (error) {
    return <ErrorFallback error={error} slug={slug} />;
  }

  if (!config || !baseLayouts) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeInjector theme={config.theme} />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        {/* Base page */}
        <LayoutResolver layouts={baseLayouts} actionContext={{ navigate }} slug={slug} stepId={baseStepId} variant={variant} />
        
        {/* Popup overlay (extracted) */}
        <PopupOverlay popupStepId={popupStepId} popupLayouts={popupLayouts} slug={slug} variant={variant} navigate={navigate} closePopup={closePopup} />
      </Suspense>
    </>
  );
};

/**
 * Error fallback component for LandingPage errors
 */
export const ErrorFallback: React.FC<{ error: Error; slug: string }> = ({ error, slug }) => {
  logger.error(`Landing page error for slug: ${slug}`, error);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Available</h1>
        <p className="text-gray-600 mb-6">
          {error.message || 'The page you requested could not be loaded.'}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return Home
        </a>
      </div>
    </div>
  );
};

export default LandingPage;