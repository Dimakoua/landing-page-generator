import React, { Suspense, useMemo } from 'react';
import type { Layout } from '../schemas';
import { createActionDispatcher } from './ActionDispatcher';
import type { ActionContext } from '../schemas/actions';
import { useEngineState } from './hooks/useEngineState';
import { useStepLayout } from './hooks/useStepLayout';
import { useInterpolation } from './hooks/useInterpolation';
import { renderSection, renderStepLayoutError, renderStepLayoutLoading } from './utils/renderSection';

interface EngineRendererProps {
  layout: Layout;
  actionContext?: Partial<ActionContext>;
  slug: string;
  stepId?: string;
  variant?: string;
}

const EngineRenderer: React.FC<EngineRendererProps> = ({
  layout,
  actionContext,
  slug,
  stepId,
  variant,
}) => {
  // State management
  const [engineState, setEngineState] = useEngineState(layout, slug, variant);

  // Interpolation utilities
  const { interpolateObject } = useInterpolation();

  // Step layout loading
  const hasStepContent = layout.sections.some(s => s.component === 'StepContent');
  const { stepLayout, stepLayoutError } = useStepLayout(hasStepContent, slug, stepId, variant);

  // Create action dispatcher with merged context
  const dispatcher = useMemo(() => {
    const defaultContext: ActionContext = {
      navigate: (stepId: string) => {
        console.warn('[EngineRenderer] navigate called but no funnel context:', stepId);
      },
      getState: (key?: string) => {
        if (key) {
          return engineState[key];
        }
        return engineState;
      },
      setState: (key: string, value: unknown, merge = true) => {
        setEngineState(prevState => ({
          ...prevState,
          [key]: merge && typeof prevState[key] === 'object' && typeof value === 'object'
            ? { ...prevState[key] as object, ...value as object }
            : value,
        }));
      },
      formData: (engineState.contactForm as Record<string, unknown>) || {},
      variant,
      ...actionContext,
    };

    return createActionDispatcher(defaultContext);
  }, [engineState, setEngineState, actionContext, variant]);

  return (
    <Suspense fallback={<div className="text-center p-8">Loading components...</div>}>
      {layout.sections.map((section, index) => {
        // Handle StepContent as a special engine component
        if (section.component === 'StepContent') {
          if (stepLayoutError) {
            return renderStepLayoutError(index, stepLayoutError);
          }

          if (!stepLayout) {
            return renderStepLayoutLoading(index);
          }

          // Render step layout sections in place of StepContent
          return (
            <React.Fragment key={index}>
              {stepLayout.sections.map((stepSection, stepIndex) =>
                renderSection({
                  section: stepSection,
                  index: stepIndex,
                  interpolateObject,
                  engineState,
                  dispatcher,
                  slug,
                  stepId,
                  variant,
                })
              )}
            </React.Fragment>
          );
        }

        // Regular component rendering
        return renderSection({
          section,
          index,
          interpolateObject,
          engineState,
          dispatcher,
          slug,
          stepId,
          variant,
        });
      })}
    </Suspense>
  );
};

export default EngineRenderer;