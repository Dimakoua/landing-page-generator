import React, { Suspense, useMemo, useState } from 'react';
import type { Layout } from '../schemas';
import ComponentMap from '../registry/ComponentMap';
import { createActionDispatcher } from './ActionDispatcher';
import type { ActionContext, Action } from '../schemas/actions';

interface EngineRendererProps {
  layout: Layout;
  actionContext?: Partial<ActionContext>;
}

const EngineRenderer: React.FC<EngineRendererProps> = ({
  layout,
  actionContext,
}) => {
  // State management for form data and other engine state
  const [engineState, setEngineState] = useState<Record<string, unknown>>({});

  // Create action dispatcher with merged context
  const dispatcher = useMemo(() => {
    const defaultContext: ActionContext = {
      navigate: (stepId: string) => {
        // Map to existing funnel navigation - simplified since we removed legacy funnelActions
        console.warn('[EngineRenderer] navigate called but no funnel context:', stepId);
      },
      getState: (key?: string) => {
        // Return specific state or all state
        if (key) {
          return engineState[key];
        }
        return engineState;
      },
      setState: (key: string, value: unknown, merge = true) => {
        // Update state with optional merge
        setEngineState(prevState => ({
          ...prevState,
          [key]: merge && typeof prevState[key] === 'object' && typeof value === 'object'
            ? { ...prevState[key] as object, ...value as object }
            : value,
        }));
        console.log(`[EngineRenderer] setState - ${key}:`, value);
      },
      formData: engineState.contactForm as Record<string, unknown> || {},
      ...actionContext,
    };

    return createActionDispatcher(defaultContext);
  }, [engineState, actionContext]);

  return (
    <Suspense fallback={<div className="text-center p-8">Loading components...</div>}>
      {layout.sections.map((section, index) => {
        const Component = ComponentMap[section.component];
        if (!Component) {
          return (
            <div key={index} className="fallback p-4 border-2 border-red-300 bg-red-50 text-red-700 rounded">
              Unknown component: {section.component}
            </div>
          );
        }

        // Pass new action system props
        const componentProps = {
          ...section.props,
          dispatcher,
          actions: section.actions as Record<string, Action> | undefined,
          state: engineState, // Pass current state for interpolation
        };

        return <Component key={index} {...componentProps} />;
      })}
    </Suspense>
  );
};

export default EngineRenderer;