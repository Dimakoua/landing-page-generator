import { useEffect, useState, useCallback } from 'react';
import type { Flow } from '../../schemas';
import { logger } from '../../utils/logger';

interface UseStepNavigationResult {
  baseStepId: string;
  popupStepId: string | null;
  initializeFromConfig: (flows: { desktop: Flow; mobile: Flow }) => void;
  navigate: (stepId: string, replace?: boolean) => void;
  closePopup: () => void;
}

export function useStepNavigation(slug: string): UseStepNavigationResult {
  logger.debug('Initializing step navigation for slug:', slug);
  const [baseStepId, setBaseStepId] = useState<string>('');
  const [popupStepId, setPopupStepId] = useState<string | null>(null);
  const [flows, setFlows] = useState<{ desktop: Flow; mobile: Flow } | null>(null);

  const initializeFromConfig = useCallback((flows: { desktop: Flow; mobile: Flow }) => {
    setFlows(flows);
    const urlParams = new URLSearchParams(window.location.search);
    const stepFromUrl = urlParams.get('step');
    const defaultStep = flows.desktop.steps[0]?.id || 'home';
    const targetStepId = stepFromUrl || defaultStep;

    const stepConfig = flows.desktop.steps.find(s => s.id === targetStepId);
    const isPopup = stepConfig?.type === 'popup';

    if (isPopup) {
      setBaseStepId(prev => prev || defaultStep);
      setPopupStepId(targetStepId);
    } else {
      setBaseStepId(targetStepId);
      setPopupStepId(null);
    }
  }, []);

  // popstate listener
  useEffect(() => {
    const handler = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const stepFromUrl = urlParams.get('step');
      // If no config available, don't change

      // We can't inspect flow here — keep behavior minimal: if stepFromUrl exists and differs, treat as popup if it equals current popup
      if (stepFromUrl && stepFromUrl !== baseStepId) {
        setPopupStepId(stepFromUrl);
        return;
      }

      setPopupStepId(null);
    };

    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [baseStepId]);

  const navigate = useCallback((stepId: string, replace?: boolean) => {
    // strip leading /
    let cleanStepId = stepId.startsWith('/') ? stepId.slice(1) : stepId;
    const defaultStep = flows?.desktop?.steps?.[0]?.id || 'home';
    if (!cleanStepId) cleanStepId = defaultStep;

    const isPopup = Boolean(flows && flows.desktop.steps.find(s => s.id === cleanStepId && s.type === 'popup'));

    if (isPopup) {
      setPopupStepId(cleanStepId);
    } else {
      setBaseStepId(cleanStepId);
      setPopupStepId(null);
    }

    const url = new URL(window.location.href);
    if (cleanStepId === defaultStep) {
      url.searchParams.delete('step');
    } else {
      url.searchParams.set('step', cleanStepId);
    }
    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  }, [flows]);

  const closePopup = useCallback(() => {
    setPopupStepId(null);
    const url = new URL(window.location.href);
    const defaultStep = baseStepId || 'home';
    if (baseStepId === defaultStep) {
      url.searchParams.delete('step');
    } else {
      url.searchParams.set('step', baseStepId);
    }
    window.history.pushState({}, '', url.toString());
  }, [baseStepId]);

  return { baseStepId, popupStepId, initializeFromConfig, navigate, closePopup };
}
