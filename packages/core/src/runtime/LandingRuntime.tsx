import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import type { Flow, Layout, Theme } from '../schemas';
import { useEngine } from './useEngine';
import { EngineRenderer } from './EngineRenderer';
import { ThemeInjector } from './ThemeInjector';

interface LandingRuntimeProps {
  slug: string;
  initialStepId?: string;
  variant?: string;
}

function getWindowUrl() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return new URL(window.location.href);
}

function getWindowStorage() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.sessionStorage;
}

function useIsDesktop(minWidth = 769) {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.innerWidth >= minWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onResize = () => {
      setIsDesktop(window.innerWidth >= minWidth);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [minWidth]);

  return isDesktop;
}

interface LoadedState {
  theme: Theme | null;
  flow: Flow | null;
  wrapperLayout: Layout | null;
  stepLayout: Layout | null;
  stepId: string | null;
}

export function LandingRuntime({ slug, initialStepId, variant }: LandingRuntimeProps) {
  const engine = useEngine();
  const isDesktop = useIsDesktop();
  const resolvedVariant = useMemo(
    () => variant ?? engine.resolveVariant({ slug, storage: getWindowStorage(), url: getWindowUrl() }),
    [engine, slug, variant]
  );
  const [loadedState, setLoadedState] = useState<LoadedState>({
    theme: null,
    flow: null,
    wrapperLayout: null,
    stepLayout: null,
    stepId: null,
  });
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const project = await engine.loaders.loadProject(slug, resolvedVariant);
        const flow = isDesktop ? project.flows.desktop : project.flows.mobile;
        const stepId = initialStepId ?? flow.steps[0]?.id;

        if (!stepId) {
          throw new Error(`Landing "${slug}" has no steps.`);
        }

        const stepConfig = flow.steps.find(step => step.id === stepId);
        if (!stepConfig) {
          throw new Error(`Step "${stepId}" was not found for landing "${slug}".`);
        }

        const stepLayouts = await engine.loaders.loadStepLayouts(slug, stepId, resolvedVariant);
        const stepLayout = isDesktop ? stepLayouts.desktop : stepLayouts.mobile;

        let wrapperLayout: Layout | null = null;
        const layoutPath = stepConfig.layout ?? flow.layout;

        if (layoutPath) {
          const namedLayouts = await engine.loaders.loadNamedLayout(slug, layoutPath, resolvedVariant);
          wrapperLayout = isDesktop ? namedLayouts.desktop : namedLayouts.mobile;
        }

        if (!cancelled) {
          setLoadedState({
            theme: project.theme,
            flow,
            wrapperLayout,
            stepLayout,
            stepId,
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError : new Error(String(loadError)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [engine, initialStepId, isDesktop, resolvedVariant, slug]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading landing...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: '#b91c1c' }}>{error.message}</div>;
  }

  if (!loadedState.theme || !loadedState.flow || !loadedState.stepLayout || !loadedState.stepId) {
    return <div style={{ padding: '2rem', color: '#b91c1c' }}>Landing could not be resolved.</div>;
  }

  const layout = loadedState.wrapperLayout ?? loadedState.stepLayout;

  return (
    <>
      <Helmet>
        <title>{loadedState.flow.seo?.title ?? slug}</title>
        {loadedState.flow.seo?.description ? <meta name="description" content={loadedState.flow.seo.description} /> : null}
        {loadedState.flow.seo?.keywords ? <meta name="keywords" content={loadedState.flow.seo.keywords} /> : null}
      </Helmet>
      <ThemeInjector theme={loadedState.theme} />
      <EngineRenderer
        layout={layout}
        stepLayout={loadedState.wrapperLayout ? loadedState.stepLayout : null}
        slug={slug}
        stepId={loadedState.stepId}
        variant={resolvedVariant}
      />
    </>
  );
}
