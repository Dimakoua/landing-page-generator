import React, { useState, useEffect, Suspense } from 'react';
import { useInterpolation } from '../../engine/hooks/useInterpolation';
import { renderSection } from '../../engine/utils/renderSection';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface LoadFromApiProps {
  endpoint: string;
  method?: string;
  onError?: Action;
  dispatcher?: ActionDispatcher;
  state?: Record<string, unknown>;
  slug?: string;
  stepId?: string;
  variant?: string;
}

const LoadFromApi: React.FC<LoadFromApiProps> = ({
  endpoint,
  method = 'GET',
  onError,
  dispatcher,
  state = {},
  slug,
  stepId,
  variant,
}) => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { interpolateObject } = useInterpolation();

  useEffect(() => {
    fetch(endpoint, { method })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.sections && Array.isArray(data.sections)) {
          setSections(data.sections);
        } else {
          throw new Error('Invalid response format: missing sections array');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('LoadFromApi fetch error:', err);
        setError(err.message);
        setLoading(false);
        if (onError && dispatcher) {
          dispatcher.dispatch(onError).catch(dispatchErr => {
            console.error('Error dispatching onError action:', dispatchErr);
          });
        }
      });
  }, [endpoint, method, onError, dispatcher]);

  if (loading) {
    return <div className="text-center p-4">Loading components...</div>;
  }

  if (error) {
    // Error is handled by onError action, so don't render anything
    return null;
  }

  return (
    <Suspense fallback={<div className="text-center p-4">Loading components...</div>}>
      {sections.map((section, index) =>
        renderSection({
          section,
          index,
          interpolateObject,
          engineState: state,
          dispatcher: dispatcher!,
          slug: slug!,
          stepId,
          variant,
        })
      )}
    </Suspense>
  );
};

export default LoadFromApi;