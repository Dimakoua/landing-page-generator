import React from 'react';
import { useMediaQuery } from 'react-responsive';
import type { Layout } from '../schemas';
import EngineRenderer from './EngineRenderer';
import { logger } from '../utils/logger';
import type { ActionContext } from '../schemas/actions';
import type { Flow } from '../schemas';

interface LayoutResolverProps {
  layouts: { desktop: Layout; mobile: Layout };
  flows: { desktop: Flow; mobile: Flow };
  actionContext?: Partial<ActionContext>;
}

const LayoutResolver: React.FC<LayoutResolverProps> = ({ layouts, flows, actionContext }) => {
  const isDesktop = useMediaQuery({ minWidth: 769 });
  const layout = isDesktop ? layouts.desktop : layouts.mobile;
  const flow = isDesktop ? flows.desktop : flows.mobile;

  logger.debug(`Rendering ${isDesktop ? 'desktop' : 'mobile'} layout`, {
    sections: layout.sections.length,
  });

  return <EngineRenderer layout={layout} actionContext={{ ...actionContext, flow }} />;
};

export default LayoutResolver;