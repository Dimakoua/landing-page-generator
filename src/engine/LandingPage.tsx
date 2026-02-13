import React, { Suspense, useEffect } from 'react';
import ThemeInjector from './ThemeInjector';
import LayoutResolver from './LayoutResolver';
import PopupOverlay from './PopupOverlay';
import { useVariant } from './hooks/useVariant';
import { useStepNavigation } from './hooks/useStepNavigation';
import { useLayoutLoader } from './hooks/useLayoutLoader';
import { useLandingConfig } from './hooks/useLandingConfig';
import { logger } from '../utils/logger';

interface LandingPageProps {
  slug: string;
}

/**
 * LandingPage - Main landing page renderer
 * Loads configuration by slug and renders the current step's layout
 */
const LandingPage: React.FC<LandingPageProps> = ({ slug }) => {
  // Variant is determined first
  const variant = useVariant(slug);
  
  // Load configuration based on slug and variant
  const { config, error: configError, isLoading: isConfigLoading } = useLandingConfig(slug, variant);

  // Navigation state management
  const { 
    baseStepId, 
    popupStepId, 
    initializeFromConfig, 
    navigate: stepNavigate, 
    closePopup 
  } = useStepNavigation(slug);

  // Load specific step layouts
  const { 
    layouts: baseLayouts, 
    error: baseError, 
    isLoading: isBaseLoading 
  } = useLayoutLoader(slug, baseStepId, variant, config);

  const { 
    layouts: popupLayouts, 
    error: popupError 
  } = useLayoutLoader(slug, popupStepId, variant, config);

  // Initialize navigation once config is loaded
  useEffect(() => {
    if (config) {
      initializeFromConfig(config.flows);
    }
  }, [config, initializeFromConfig]);

  const error = configError || baseError || popupError;

  if (error) {
    return <ErrorFallback error={error} slug={slug} />;
  }

  // Show loading state if config or base layouts are not yet available
  const isLoading = isConfigLoading || isBaseLoading;

  if (isLoading || !config || !baseStepId || !baseLayouts) {
    return <LoadingFallback />;
  }

  const navigate = (stepId: string, replace?: boolean) => stepNavigate(stepId, replace);

  return (
    <>
      <ThemeInjector theme={config.theme} />
      <Suspense fallback={<LoadingFallback />}>
        {/* Base page */}
        <LayoutResolver
          layouts={baseLayouts}
          actionContext={{ 
            navigate, 
            allowCustomHtml: config.theme?.allowCustomHtml ?? false 
          }}
          slug={slug}
          stepId={baseStepId}
          variant={variant}
        />
        
        {/* Popup overlay */}
        <PopupOverlay
          popupStepId={popupStepId}
          popupLayouts={popupLayouts}
          slug={slug}
          variant={variant}
          navigate={navigate}
          closePopup={closePopup}
        />
      </Suspense>
    </>
  );
};

/**
 * Shared loading UI
 */
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

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
