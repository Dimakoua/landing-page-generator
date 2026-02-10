import React from 'react';
import { useMediaQuery } from 'react-responsive';
import type { Layout } from '../schemas';
import EngineRenderer from './EngineRenderer';
import { logger } from '../utils/logger';

interface LayoutResolverProps {
  layouts: { desktop: Layout; mobile: Layout };
  funnelActions?: {
    goToNext: (action?: 'approve' | 'decline') => void;
  };
}

const LayoutResolver: React.FC<LayoutResolverProps> = ({ layouts, funnelActions }) => {
  const isDesktop = useMediaQuery({ minWidth: 769 });
  const layout = isDesktop ? layouts.desktop : layouts.mobile;

  logger.debug(`Rendering ${isDesktop ? 'desktop' : 'mobile'} layout`, {
    sections: layout.sections.length,
  });

  return <EngineRenderer layout={layout} funnelActions={funnelActions} />;
};

export default LayoutResolver;