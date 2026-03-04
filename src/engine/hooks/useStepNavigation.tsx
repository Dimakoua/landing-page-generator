import { useEffect, useState, useCallback } from 'react';
import type { Flow } from '../../schemas';

interface UseStepNavigationResult {
  baseStepId: string;
  popupStepId: string | null;
  initializeFromConfig: (flows: { desktop: Flow; mobile: Flow }) => void;
  navigate: (stepId: string, replace?: boolean) => void;
  closePopup: () => void;
}

export function useStepNavigation(): UseStepNavigationResult {
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
      
      if (!flows) return;

      // Check if the step from URL is actually a popup type
      const stepConfig = flows.desktop.steps.find(s => s.id === stepFromUrl);
      const isPopup = stepConfig?.type === 'popup';

      if (stepFromUrl && isPopup) {
        // It's a popup, so keep it as popup
        setPopupStepId(stepFromUrl);
      } else if (stepFromUrl) {
        // It's a regular step, set as base and close popup
        setBaseStepId(stepFromUrl);
        setPopupStepId(null);
      } else {
        // No step in URL, go to base and close popup
        const defaultStep = flows.desktop.steps[0]?.id || 'home';
        setBaseStepId(defaultStep);
        setPopupStepId(null);
      }
    };

    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [flows]);

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
