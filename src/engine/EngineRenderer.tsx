import React, { Suspense } from 'react';
import type { Layout } from '../engine/schemas';
import componentMap from '../registry';

interface EngineRendererProps {
  layout: Layout;
}

const EngineRenderer: React.FC<EngineRendererProps> = ({ layout }) => {
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
        return <Component key={index} {...section.props} />;
      })}
    </Suspense>
  );
};

export default EngineRenderer;