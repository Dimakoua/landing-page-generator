import React, { Suspense, useMemo } from 'react';
import type { Layout } from '../schemas';
import ComponentMap from '../registry/ComponentMap';
import { createActionDispatcher, type ActionContext, type Action } from './ActionDispatcher';

interface EngineRendererProps {
  layout: Layout;
  actionContext?: Partial<ActionContext>;
}

const EngineRenderer: React.FC<EngineRendererProps> = ({
  layout,
  actionContext,
}) => {
  // Create action dispatcher with merged context
  const dispatcher = useMemo(() => {
    const defaultContext: ActionContext = {
      navigate: (stepId: string) => {
        // Map to existing funnel navigation - simplified since we removed legacy funnelActions
        console.warn('[EngineRenderer] navigate called but no funnel context:', stepId);
      },
      getState: () => {
        // Placeholder - could integrate with Zustand store
        return undefined;
      },
      setState: (key: string, value: unknown) => {
        // Placeholder - could integrate with Zustand store
        console.warn('[EngineRenderer] setState not implemented:', key, value);
      },
      formData: {},
      ...actionContext,
    };

    return createActionDispatcher(defaultContext);
  }, [actionContext]);

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
        };

        return <Component key={index} {...componentProps} />;
      })}
    </Suspense>
  );
};

export default EngineRenderer;