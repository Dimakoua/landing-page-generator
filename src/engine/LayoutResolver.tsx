import React from 'react';
import { useMediaQuery } from 'react-responsive';
import type { Layout } from '../schemas';
import EngineRenderer from './EngineRenderer';

interface LayoutResolverProps {
  layouts: { desktop: Layout; mobile: Layout };
  funnelActions?: {
    goToNext: (action?: 'approve' | 'decline') => void;
  };
}

const LayoutResolver: React.FC<LayoutResolverProps> = ({ layouts, funnelActions }) => {
  const isDesktop = useMediaQuery({ minWidth: 769 });
  const layout = isDesktop ? layouts.desktop : layouts.mobile;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Layout Resolver ({isDesktop ? 'Desktop' : 'Mobile'})
      </h2>
      <EngineRenderer layout={layout} funnelActions={funnelActions} />
    </div>
  );
};

export default LayoutResolver;