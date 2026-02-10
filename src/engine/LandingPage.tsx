import React, { Suspense, useState, useEffect } from 'react';
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
  const [config, setConfig] = useState<{ theme: any; flow: any } | null>(null);
  const [layouts, setLayouts] = useState<{ desktop: any; mobile: any } | null>(null);
  const [error, setError] = useState<Error | null>(null);

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

  const { currentStepId, goToNext } = useFunnel(config?.flow || { steps: [] });

  useEffect(() => {
    if (config && currentStepId) {
      const loadLayouts = async () => {
        try {
          logger.debug(`Loading layouts for step: ${currentStepId}`);
          const layoutData = await getStepLayouts(slug, currentStepId);
          setLayouts(layoutData);
        } catch (err) {
          logger.error(`Failed to load layouts for step: ${currentStepId}`, err);
          setError(err as Error);
        }
      };

      loadLayouts();
    }
  }, [slug, currentStepId, config]);

  if (error) {
    return <ErrorFallback error={error} slug={slug} />;
  }

  if (!config || !layouts) {
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
        <LayoutResolver layouts={layouts} funnelActions={{ goToNext }} />
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