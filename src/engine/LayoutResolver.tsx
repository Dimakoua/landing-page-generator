import React from 'react';
import { useMediaQuery } from 'react-responsive';
import type { Layout } from './schemas';

interface LayoutResolverProps {
  layouts: { desktop: Layout; mobile: Layout };
}

const LayoutResolver: React.FC<LayoutResolverProps> = ({ layouts }) => {
  const isDesktop = useMediaQuery({ minWidth: 769 });
  const layout = isDesktop ? layouts.desktop : layouts.mobile;

  return (
    <div className="mt-8 p-4 border rounded">
      <h2 className="text-2xl font-semibold mb-4">
        Layout Resolver ({isDesktop ? 'Desktop' : 'Mobile'})
      </h2>
      <div className="space-y-4">
        {layout.sections.map((section, index) => (
          <div key={index} className="p-4 border rounded bg-gray-50">
            <h3 className="font-bold">{section.component}</h3>
            <pre className="text-sm text-gray-600 mt-2">
              {JSON.stringify(section.props, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutResolver;