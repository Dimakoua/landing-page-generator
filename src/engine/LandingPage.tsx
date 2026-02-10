import React, { Suspense, useMemo } from 'react';
import { getProjectConfig, getStepLayouts } from './ProjectResolver';
import ThemeInjector from './ThemeInjector';
import { useFunnel } from './useFunnel';
import LayoutResolver from './LayoutResolver';
import { logger } from '../utils/logger';

interface LandingPageProps {
  slug: string;
}

/**
 * LandingPage - Main landing page renderer
 * Loads configuration by slug and renders the current step's layout
 */
const LandingPage: React.FC<LandingPageProps> = ({ slug }) => {
  const configMemoized = useMemo(() => {
    try {
      logger.debug(`Loading config for slug: ${slug}`);
      return getProjectConfig(slug);
    } catch (error) {
      logger.error(`Failed to load config for slug: ${slug}`, error);
      throw error;
    }
  }, [slug]);

  const { theme, flow } = configMemoized;
  const { currentStepId, goToNext } = useFunnel(flow);

  const layoutsMemoized = useMemo(() => {
    try {
      logger.debug(`Loading layouts for step: ${currentStepId}`);
      return getStepLayouts(slug, currentStepId);
    } catch (error) {
      logger.error(`Failed to load layouts for step: ${currentStepId}`, error);
      throw error;
    }
  }, [slug, currentStepId]);

  return (
    <>
      <ThemeInjector theme={theme} />
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
        <LayoutResolver layouts={layoutsMemoized} funnelActions={{ goToNext }} />
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