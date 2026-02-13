import React from 'react';
import { useMediaQuery } from 'react-responsive';
import type { Layout } from '../schemas';
import EngineRenderer from './EngineRenderer';
import { logger } from '../utils/logger';
import type { ActionContext } from '../schemas/actions';

interface LayoutResolverProps {
  layouts: { desktop: Layout; mobile: Layout };
  actionContext?: Partial<ActionContext>;
  slug: string;
  stepId?: string;
  variant?: string;
}

const LayoutResolver: React.FC<LayoutResolverProps> = ({ layouts, actionContext, slug, stepId, variant }) => {
  const isDesktop = useMediaQuery({ minWidth: 769 });

  if (!layouts) {
    logger.warn(`No layouts provided to LayoutResolver for step: ${stepId}`);
    return null;
  }

  const layout = isDesktop ? layouts.desktop : layouts.mobile;

  logger.debug(`Rendering ${isDesktop ? 'desktop' : 'mobile'} layout`, {
    sections: layout.sections.length,
  });

  return <EngineRenderer layout={layout} actionContext={actionContext} slug={slug} stepId={stepId} variant={variant} />;
};

export default LayoutResolver;