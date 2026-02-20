import React from 'react';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';
import type { LayoutSection } from '../../schemas';
import { renderSection } from '../../engine/utils/renderSection';
import { useInterpolation } from '../../engine/hooks/useInterpolation';

interface WrapperProps {
  sections: LayoutSection[];
  className?: string;
  style?: React.CSSProperties;
  tag?: keyof JSX.IntrinsicElements;
  dispatcher: ActionDispatcher;
  actions?: Record<string, Action>;
  state: Record<string, unknown>;
  slug: string;
  stepId?: string;
  variant?: string;
}

/**
 * Wrapper Component
 * A container that can host nested sections, allowing for complex layouts like grids or side-by-side components.
 */
const Wrapper: React.FC<WrapperProps> = props => {
  const {
    sections = [],
    className,
    style,
    tag = 'div',
    dispatcher,
    state,
    slug,
    stepId,
    variant,
  } = props;

  const { interpolateObject } = useInterpolation();

  // Dynamically create tag to support div, section, article etc
  const Tag = tag as any;

  if (!sections || !Array.isArray(sections)) {
    return null;
  }

  return (
    <Tag className={className} style={style}>
      {sections.map((section, index) =>
        renderSection({
          section,
          index,
          interpolateObject,
          engineState: state,
          dispatcher,
          slug,
          stepId,
          variant,
        })
      )}
    </Tag>
  );
};

export default Wrapper;
