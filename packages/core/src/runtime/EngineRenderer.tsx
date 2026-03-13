import { Fragment, useMemo, useState } from 'react';

import type { Layout, LayoutSection } from '../schemas';
import { useEngine } from './useEngine';

interface EngineRendererProps {
  layout: Layout;
  stepLayout?: Layout | null;
  slug: string;
  stepId: string;
  variant?: string;
}

function SectionFallback({ componentName }: { componentName: string }) {
  return (
    <div style={{ border: '1px solid #f59e0b', padding: '1rem', borderRadius: '0.5rem', background: '#fffbeb' }}>
      Unknown component: {componentName}
    </div>
  );
}

export function EngineRenderer({ layout, stepLayout, slug, stepId, variant }: EngineRendererProps) {
  const engine = useEngine();
  const initialState = useMemo(
    () => ({
      ...(layout.state ?? {}),
      ...(stepLayout?.state ?? {}),
    }),
    [layout.state, stepLayout?.state]
  );
  const [engineState] = useState<Record<string, unknown>>(initialState);

  const renderSection = (section: LayoutSection, index: number) => {
    if (section.component === 'StepContent') {
      return stepLayout?.sections.map((stepSection, stepIndex) => (
        <Fragment key={`step-${stepSection.id ?? stepSection.component}-${stepIndex}`}>
          {renderSection(stepSection, stepIndex)}
        </Fragment>
      ));
    }

    const Component = engine.components[section.component];
    const key = section.id ?? `${section.component}-${index}`;

    const rendered = Component ? (
      <Component
        {...(section.props ?? {})}
        actions={section.actions}
        state={engineState}
        slug={slug}
        stepId={stepId}
        variant={variant}
      />
    ) : (
      <SectionFallback componentName={section.component} />
    );

    if (section.id) {
      return (
        <div id={section.id} key={key}>
          {rendered}
        </div>
      );
    }

    return <Fragment key={key}>{rendered}</Fragment>;
  };

  return <>{layout.sections.map(renderSection)}</>;
}
