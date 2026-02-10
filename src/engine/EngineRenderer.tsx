import React, { Suspense } from 'react';
import type { Layout } from '../engine/schemas';
import componentMap from '../registry';

interface EngineRendererProps {
  layout: Layout;
  funnelActions?: {
    goToNext: (action?: 'approve' | 'decline') => void;
  };
}

const EngineRenderer: React.FC<EngineRendererProps> = ({ layout, funnelActions }) => {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading components...</div>}>
      {layout.sections.map((section, index) => {
        const Component = componentMap[section.component];
        if (!Component) {
          return (
            <div key={index} className="fallback p-4 border-2 border-red-300 bg-red-50 text-red-700 rounded">
              Unknown component: {section.component}
            </div>
          );
        }

        // Special handling for components that need funnel actions
        if (section.component === 'SimpleCTA') {
          return (
            <Component
              key={index}
              {...section.props}
              onAction={funnelActions?.goToNext}
            />
          );
        }

        return <Component key={index} {...section.props} />;
      })}
    </Suspense>
  );
};

export default EngineRenderer;