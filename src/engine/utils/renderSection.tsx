import ComponentMap from '../../registry/ComponentMap';
import type { Layout } from '../../schemas';
import type { Action } from '../../schemas/actions';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';

interface SectionRenderProps {
  section: Layout['sections'][number];
  index: number;
  interpolateObject: (obj: Record<string, unknown>, state: Record<string, unknown>) => Record<string, unknown>;
  engineState: Record<string, unknown>;
  dispatcher: ActionDispatcher;
  slug: string;
  stepId?: string;
  variant?: string;
}

/**
 * Renders a single section with proper error handling and ID wrapping
 */
export function renderSection({
  section,
  index,
  interpolateObject,
  engineState,
  dispatcher,
  slug,
  stepId,
  variant,
}: SectionRenderProps) {
  const Component = ComponentMap[section.component];
  if (!Component) {
    return (
      <div key={index} className="fallback p-4 border-2 border-red-300 bg-red-50 text-red-700 rounded">
        Unknown component: {section.component}
      </div>
    );
  }

  const componentProps = {
    ...(section.props ? interpolateObject(section.props as Record<string, unknown>, engineState) : {}),
    dispatcher,
    actions: section.actions as Record<string, Action> | undefined,
    state: engineState,
    slug,
    stepId,
    variant,
  };

  const component = <Component key={index} {...componentProps} />;

  // Wrap with ID if section has an id (enables anchor link scrolling)
  if (section.id) {
    return (
      <div key={index} id={section.id}>
        {component}
      </div>
    );
  }

  return component;
}

/**
 * Renders error state for step layout
 */
export function renderStepLayoutError(index: number, error: Error) {
  return (
    <div
      key={index}
      className="fallback p-4 border-2 border-yellow-300 bg-yellow-50 text-yellow-700 rounded"
    >
      <p className="font-semibold">Step content unavailable</p>
      <p className="text-sm mt-1">{error.message}</p>
    </div>
  );
}

/**
 * Renders loading state for step layout
 */
export function renderStepLayoutLoading(index: number) {
  return (
    <div key={index} className="text-center p-8">
      Loading step content...
    </div>
  );
}
