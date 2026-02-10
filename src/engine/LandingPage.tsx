import React, { Suspense, useState, useEffect } from 'react';
import { getProjectConfig, getStepLayouts } from './ProjectResolver';
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

  useEffect(() => {
    const loadConfig = async () => {
      try {
        logger.debug(`Loading config for slug: ${slug}`);
        const configData = await getProjectConfig(slug);
        setConfig(configData);
      } catch (err) {
        logger.error(`Failed to load config for slug: ${slug}`, err);
        setError(err as Error);
      }
    };

    loadConfig();
  }, [slug]);

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
        if (!baseStepId) setBaseStepId(defaultStep);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPopupStepId(targetStepId);
      } else {
        // For normal step, set as base and clear popup
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBaseStepId(targetStepId);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPopupStepId(null);
      }
    }
  }, [config, baseStepId]);

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      if (config) {
        const urlParams = new URLSearchParams(window.location.search);
        const stepFromUrl = urlParams.get('step');
        if (stepFromUrl) {
          const stepConfig = config.flows.desktop.steps.find(s => s.id === stepFromUrl);
          const isPopup = stepConfig?.type === 'popup';
          
          if (isPopup) {
            setPopupStepId(stepFromUrl);
          } else {
            setBaseStepId(stepFromUrl);
            setPopupStepId(null);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [config]);

  // Navigate function to change step and update URL
  const navigate = (stepId: string) => {
    // Strip leading '/' if present, as stepId should be just the id
    const cleanStepId = stepId.startsWith('/') ? stepId.slice(1) : stepId;
    
    if (!config) return;
    
    // Check if target step is a popup
    const stepConfig = config.flows.desktop.steps.find(s => s.id === cleanStepId);
    const isPopup = stepConfig?.type === 'popup';
    
    if (isPopup) {
      // Open as popup overlay
      setPopupStepId(cleanStepId);
    } else {
      // Navigate to new base page, close any popup
      setBaseStepId(cleanStepId);
      setPopupStepId(null);
    }
    
    const url = new URL(window.location.href);
    url.searchParams.set('step', cleanStepId);
    window.history.pushState({}, '', url.toString());
  };
  
  // Close popup and return to base step
  const closePopup = () => {
    setPopupStepId(null);
    const url = new URL(window.location.href);
    url.searchParams.set('step', baseStepId);
    window.history.pushState({}, '', url.toString());
  };

  // Load base step layouts
  useEffect(() => {
    if (config && baseStepId) {
      const loadLayouts = async () => {
        try {
          logger.debug(`Loading base layouts for step: ${baseStepId}`);
          const layoutData = await getStepLayouts(slug, baseStepId);
          setBaseLayouts(layoutData);
        } catch (err) {
          logger.error(`Failed to load base layouts for step: ${baseStepId}`, err);
          setError(err as Error);
        }
      };

      loadLayouts();
    }
  }, [slug, baseStepId, config]);
  
  // Load popup step layouts
  useEffect(() => {
    if (config && popupStepId) {
      const loadLayouts = async () => {
        try {
          logger.debug(`Loading popup layouts for step: ${popupStepId}`);
          const layoutData = await getStepLayouts(slug, popupStepId);
          setPopupLayouts(layoutData);
        } catch (err) {
          logger.error(`Failed to load popup layouts for step: ${popupStepId}`, err);
          setError(err as Error);
        }
      };

      loadLayouts();
    } else {
      setPopupLayouts(null);
    }
  }, [slug, popupStepId, config]);

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
        <LayoutResolver layouts={baseLayouts} actionContext={{ navigate }} slug={slug} />
        
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
              <LayoutResolver layouts={popupLayouts} actionContext={{ navigate, closePopup }} slug={slug} />
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