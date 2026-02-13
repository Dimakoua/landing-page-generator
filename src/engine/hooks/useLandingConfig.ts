import { useState, useEffect, useRef } from 'react';
import { getProjectConfig } from '../ProjectResolver';
import { logger } from '../../utils/logger';
import type { Theme, Flow } from '../../schemas';

interface LandingConfig {
  theme: Theme;
  flows: { desktop: Flow; mobile: Flow };
}

/**
 * Hook to load and manage landing page configuration
 */
export function useLandingConfig(slug: string, variant?: string) {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadingLock = useRef<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      if (!variant) return; // Wait for variant to be determined
      
      const currentKey = `${slug}:${variant}`;
      if (loadingLock.current === currentKey) return;
      loadingLock.current = currentKey;

      setIsLoading(true);
      try {
        logger.debug(`Loading config for slug: ${slug}, variant: ${variant}`);
        const configData = await getProjectConfig(slug, variant);
        setConfig(configData);
        setError(null);
      } catch (err) {
        logger.error(`Failed to load config for slug: ${slug}, variant: ${variant}`, err);
        setError(err as Error);
        loadingLock.current = null;
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [slug, variant]);

  return { config, error, isLoading };
}
