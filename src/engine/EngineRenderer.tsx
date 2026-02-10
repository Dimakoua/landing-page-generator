import React, { Suspense, useMemo } from 'react';
import type { Layout } from '../schemas';
import ComponentMap from '../registry/ComponentMap';
import { createActionDispatcher, type ActionContext, type Action } from './ActionDispatcher';

interface EngineRendererProps {
  layout: Layout;
  funnelActions?: {
    goToNext: (action?: 'approve' | 'decline') => void;
  };
  actionContext?: Partial<ActionContext>;
}

const EngineRenderer: React.FC<EngineRendererProps> = ({ 
  layout, 
  funnelActions,
  actionContext,
}) => {
  // Create action dispatcher with merged context
  const dispatcher = useMemo(() => {
    const defaultContext: ActionContext = {
      navigate: (stepId: string) => {
        // Map to existing funnel navigation
        if (funnelActions?.goToNext) {
          // Simple mapping: if stepId contains approve/decline, use that
          const action = stepId === 'approve' || stepId.includes('approve') 
            ? 'approve' 
            : stepId === 'decline' || stepId.includes('decline')
            ? 'decline'
            : undefined;
          funnelActions.goToNext(action);
        }
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
  }, [funnelActions, actionContext]);

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

        // Pass both the legacy onAction handler and the new dispatcher + actions
        const componentProps = {
          ...section.props,
          // Legacy support
          onAction: funnelActions?.goToNext,
          // New action system
          dispatcher,
          actions: section.actions as Record<string, Action> | undefined,
        };

        return <Component key={index} {...componentProps} />;
      })}
    </Suspense>
  );
};

export default EngineRenderer;