import React, { Suspense, useState, useEffect } from 'react';
import { getProjectConfig, getLayoutByPath, getStepLayouts } from './ProjectResolver';
import ThemeInjector from './ThemeInjector';
import LayoutResolver from './LayoutResolver';
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
  const [baseStepId, setBaseStepId] = useState<string>('');
  const [popupStepId, setPopupStepId] = useState<string | null>(null);
  const [variant, setVariant] = useState<string | undefined>(undefined);

  // Determine A/B testing variant
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const variantFromUrl = urlParams.get('variant');
    if (variantFromUrl) {
      setVariant(variantFromUrl);
    } else {
      // Random assignment for A/B testing
      const randomVariant = Math.random() < 0.5 ? 'A' : 'B';
      setVariant(randomVariant);
      // Optionally persist in sessionStorage to keep consistent for the user
      sessionStorage.setItem(`ab_variant_${slug}`, randomVariant);
    }
  }, [slug]);

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

  // Initialize step from URL params or default (using desktop flow as default)
  useEffect(() => {
    if (config) {
      const urlParams = new URLSearchParams(window.location.search);
      const stepFromUrl = urlParams.get('step');
      const defaultStep = config.flows.desktop.steps[0]?.id || 'home';
      const targetStepId = stepFromUrl || defaultStep;

      // Check if target step is a popup
      const stepConfig = config.flows.desktop.steps.find(s => s.id === targetStepId);
      const isPopup = stepConfig?.type === 'popup';

      if (isPopup) {
        // For popup, keep current base or use default, and set popup
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBaseStepId(prev => prev || defaultStep);
         
        setPopupStepId(targetStepId);
      } else {
        // For normal step, set as base and clear popup
         
        setBaseStepId(targetStepId);
         
        setPopupStepId(null);
      }

      logger.debug(`[LandingPage] Initializing step: ${targetStepId}, isPopup: ${isPopup}`);
    }
  }, [config]);

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      if (config) {
        const urlParams = new URLSearchParams(window.location.search);
        const stepFromUrl = urlParams.get('step');
        const defaultStep = config.flows.desktop.steps[0]?.id || 'home';
        const targetStepId = stepFromUrl || defaultStep;

        // Check if target step is a popup
        const stepConfig = config.flows.desktop.steps.find(s => s.id === targetStepId);
        const isPopup = stepConfig?.type === 'popup';

        logger.debug(`[LandingPage] Browser navigation to step: ${targetStepId}, isPopup: ${isPopup}`);

        if (isPopup) {
          setPopupStepId(targetStepId);
        } else {
          setBaseStepId(targetStepId);
          setPopupStepId(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [config]);

  // Navigate function to change step and update URL
  const navigate = (stepId: string) => {
    if (!config) return;

    // Strip leading '/' if present, as stepId should be just the id
    let cleanStepId = stepId.startsWith('/') ? stepId.slice(1) : stepId;

    // Get default (first) step
    const defaultStep = config.flows.desktop.steps[0]?.id || 'home';

    // If empty string (from '/'), navigate to default step
    if (!cleanStepId) {
      cleanStepId = defaultStep;
    }

    // Check if target step is a popup
    const stepConfig = config.flows.desktop.steps.find(s => s.id === cleanStepId);
    const isPopup = stepConfig?.type === 'popup';

    logger.debug(`[LandingPage] Navigating to step: ${cleanStepId}, isPopup: ${isPopup}`);

    if (isPopup) {
      // Open as popup overlay
      setPopupStepId(cleanStepId);
    } else {
      // Navigate to new base page, close any popup
      setBaseStepId(cleanStepId);
      setPopupStepId(null);
    }

    const url = new URL(window.location.href);

    if (cleanStepId === defaultStep) {
      // Remove step parameter when navigating to default step for cleaner URLs
      url.searchParams.delete('step');
    } else {
      url.searchParams.set('step', cleanStepId);
    }

    window.history.pushState({}, '', url.toString());
  };
  
  // Close popup and return to base step
  const closePopup = () => {
    setPopupStepId(null);
    const url = new URL(window.location.href);
    const defaultStep = config?.flows.desktop.steps[0]?.id || 'home';
    
    if (baseStepId === defaultStep) {
      // Remove step parameter when returning to default step
      url.searchParams.delete('step');
    } else {
      url.searchParams.set('step', baseStepId);
    }
    
    window.history.pushState({}, '', url.toString());
  };

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
          let layoutPath = stepConfig.layout || config.flows.desktop.layout;
          
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
          let layoutPath = stepConfig.layout || config.flows.desktop.layout;
          
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
        
        {/* Popup overlay */}
        {popupStepId && popupLayouts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-auto">
              {/* Close button */}
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Close popup"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Popup content */}
              <LayoutResolver layouts={popupLayouts} actionContext={{ navigate, closePopup }} slug={slug} stepId={popupStepId} variant={variant} />
            </div>
          </div>
        )}
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