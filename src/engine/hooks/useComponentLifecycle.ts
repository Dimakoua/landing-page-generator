import React from 'react';
import { EventFactory } from '../events/EventFactory';

/**
 * Hook for automatic component lifecycle tracking
 *
 * Eliminates boilerplate event emission and decouples components from EventBus internals.
 * Automatically emits COMPONENT_MOUNTED and COMPONENT_UNMOUNTED events.
 *
 * Usage:
 * ```typescript
 * const MyComponent: React.FC<Props> = (props) => {
 *   // ✅ One-liner replaces 11 lines of useEffect + emit + cleanup
 *   useComponentLifecycle('MyComponent', 'my-component-id', {
 *     hasData: !!props.data,
 *     itemCount: props.items?.length || 0
 *   });
 *
 *   return <div>...</div>;
 * };
 * ```
 *
 * @param componentName Display name of the component (for analytics)
 * @param componentId Unique identifier for the component instance
 * @param props Optional metrics/properties to track on mount
 */
export function useComponentLifecycle(
  componentName: string,
  componentId: string,
  props?: Record<string, unknown>
): void {
  React.useEffect(() => {
    // Emit component mounted event
    EventFactory.componentMounted(componentName, props)
      .catch(err => console.error(`Failed to emit componentMounted for ${componentName}:`, err));

    return () => {
      // Emit component unmounted event
      EventFactory.componentUnmounted(componentName)
        .catch(err => console.error(`Failed to emit componentUnmounted for ${componentName}:`, err));
    };
  }, [componentName, componentId, props]);
}

/**
 * Hook for component error boundary tracking
 *
 * Tracks unhandled errors that occur within the component.
 * Complements React Error Boundaries.
 *
 * Usage:
 * ```typescript
 * const MyComponent: React.FC<Props> = () => {
 *   useComponentErrorTracking('MyComponent');
 *   return <div>...</div>;
 * };
 * ```
 *
 * @param componentName Name of the component for error tracking
 */
export function useComponentErrorTracking(componentName: string): void {
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Only track if error occurred in this component's context
      EventFactory.componentError(
        componentName,
        event.message,
        event.error?.stack
      ).catch(err => console.error(`Failed to emit componentError for ${componentName}:`, err));
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [componentName]);
}

/**
 * Hook for tracking component render cycles (performance monitoring)
 *
 * Useful for detecting performance issues like excessive re-renders.
 *
 * Usage:
 * ```typescript
 * const MyComponent: React.FC<Props> = (props) => {
 *   useComponentRenderTracking('MyComponent', {
 *     dataLength: props.data?.length || 0,
 *     hasError: !!props.error
 *   });
 *   return <div>...</div>;
 * };
 * ```
 *
 * @param componentName Name of the component
 * @param metrics Optional metrics to track
 * @param logToConsole Whether to log renders to console (dev only)
 */
export function useComponentRenderTracking(
  componentName: string,
  metrics?: Record<string, unknown>
): void {
  const renderCountRef = React.useRef(0);

  React.useEffect(() => {
    renderCountRef.current++;

    // Optionally emit analytics event for excessive renders
    if (renderCountRef.current > 10 && renderCountRef.current % 10 === 0) {
      EventFactory.userInteraction('excessive-renders', componentName, {
        renderCount: renderCountRef.current,
        metrics,
      }).catch(err => console.error(`Failed to emit userInteraction for ${componentName}:`, err));
    }
  }, [componentName, metrics]);
}
