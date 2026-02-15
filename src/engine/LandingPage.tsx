import React, { Suspense, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import ThemeInjector from './ThemeInjector';
import LayoutResolver from './LayoutResolver';
import PopupOverlay from './PopupOverlay';
import { useVariant } from './hooks/useVariant';
import { useStepNavigation } from './hooks/useStepNavigation';
import { useLayoutLoader } from './hooks/useLayoutLoader';
import { useLandingConfig } from './hooks/useLandingConfig';
import { useEngineState } from './hooks/useEngineState';
import { logger } from '../utils/logger';
import type { LandingConfig } from './hooks/useLandingConfig';

interface LandingPageProps {
  slug: string;
}

interface SEOHeadProps {
  seoTitle: string;
  seoDescription: string;
  slug: string;
  variant?: string;
  config: LandingConfig | null;
}

interface ErrorFallbackProps {
  error: Error;
  slug: string;
}

/**
 * LandingPage - Main landing page renderer
 * Loads configuration by slug and renders the current step's layout
 */
const LandingPage: React.FC<LandingPageProps> = ({ slug }: LandingPageProps) => {
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
  } = useStepNavigation();

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

  // Shared engine state for the entire page
  const [engineState, setEngineState] = useEngineState(
    baseLayouts?.desktop || { sections: [] }, 
    slug, 
    variant
  );

  // Memoized navigation and context
  const navigate = useCallback((stepId: string, replace?: boolean) => {
    stepNavigate(stepId, replace);
  }, [stepNavigate]);

  const actionContext = useMemo(() => ({ 
    navigate, 
    allowCustomHtml: config?.theme?.allowCustomHtml ?? false 
  }), [navigate, config?.theme?.allowCustomHtml]);

  // SEO metadata with fallbacks
  const seoTitle = useMemo(() => 
    config?.flows.desktop.seo?.title || `${slug.charAt(0).toUpperCase() + slug.slice(1)} Landing Page`,
    [config?.flows.desktop.seo?.title, slug]
  );
  
  const seoDescription = useMemo(() => 
    config?.flows.desktop.seo?.description || 'High-converting landing page',
    [config?.flows.desktop.seo?.description]
  );

  // Initialize navigation once config is loaded
  useEffect(() => {
    if (config) {
      initializeFromConfig(config.flows);
    }
  }, [config, initializeFromConfig]);

  // Update document title (fallback for Helmet race conditions)
  useEffect(() => {
    document.title = seoTitle;
  }, [seoTitle]);

  // Error and loading state checks (after all hooks)
  const error = configError || baseError || popupError;
  const isLoading = isConfigLoading || isBaseLoading;

  if (error) {
    return <ErrorFallback error={error} slug={slug} />;
  }

  // Show loading state if necessary
  if (isLoading || !baseStepId || !baseLayouts || !config) {
    return (
      <>
        <SEOHead seoTitle={seoTitle} seoDescription={seoDescription} slug={slug} variant={variant} config={config} />
        <LoadingFallback />
      </>
    );
  }

  return (
    <>
      <SEOHead seoTitle={seoTitle} seoDescription={seoDescription} slug={slug} variant={variant} config={config} />
      <ThemeInjector theme={config.theme} />
      <Suspense fallback={<LoadingFallback />}>
        <LayoutResolver
          layouts={baseLayouts}
          actionContext={actionContext}
          slug={slug}
          stepId={baseStepId}
          variant={variant}
          engineState={engineState}
          setEngineState={setEngineState}
        />
        <PopupOverlay
          popupStepId={popupStepId}
          popupLayouts={popupLayouts}
          slug={slug}
          variant={variant}
          navigate={navigate}
          closePopup={closePopup}
          engineState={engineState}
          setEngineState={setEngineState}
        />
      </Suspense>
    </>
  );
};

/**
 * SEO head component - Separated for clarity and reusability
 */
const SEOHead: React.FC<SEOHeadProps> = ({ seoTitle, seoDescription, slug, variant, config }) => (
  <Helmet key={`${slug}-${variant}-${config ? 'loaded' : 'loading'}`}>
    <title>{seoTitle}</title>
    <meta name="description" content={seoDescription} />
    {config?.flows.desktop.seo?.keywords && (
      <meta name="keywords" content={config.flows.desktop.seo.keywords} />
    )}
    {config?.flows.desktop.seo?.ogTitle && (
      <meta property="og:title" content={config.flows.desktop.seo.ogTitle} />
    )}
    {config?.flows.desktop.seo?.ogDescription && (
      <meta property="og:description" content={config.flows.desktop.seo.ogDescription} />
    )}
    {config?.flows.desktop.seo?.ogImage && (
      <meta property="og:image" content={config.flows.desktop.seo.ogImage} />
    )}
    <meta property="og:type" content="website" />
  </Helmet>
);

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
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, slug }) => {
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
