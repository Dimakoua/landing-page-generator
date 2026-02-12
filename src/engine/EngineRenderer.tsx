import React, { Suspense, useMemo, useState, useEffect } from 'react';
import type { Layout } from '../schemas';
import ComponentMap from '../registry/ComponentMap';
import { createActionDispatcher } from './ActionDispatcher';
import { getStepLayouts } from './ProjectResolver';
import type { ActionContext, Action } from '../schemas/actions';
import { logger } from '../utils/logger';

interface EngineRendererProps {
  layout: Layout;
  actionContext?: Partial<ActionContext>;
  slug: string;
  stepId?: string;
  variant?: string;
}

const EngineRenderer: React.FC<EngineRendererProps> = ({
  layout,
  actionContext,
  slug,
  stepId,
  variant,
}) => {
  // Generate a storage key based on the landing page slug and variant
  const storageKey = variant ? `lp_factory_state_${slug}_${variant}` : `lp_factory_state_${slug}`;

  // Load initial state from localStorage
  const loadInitialState = (): Record<string, unknown> => {
    try {
      // Try to load with variant-specific key first
      let stored = localStorage.getItem(storageKey);
      
      // If not found, try without variant as fallback
      if (!stored && variant) {
        const fallbackKey = `lp_factory_state_${slug}`;
        stored = localStorage.getItem(fallbackKey);
        if (stored) {
          logger.debug(`[EngineRenderer] Using fallback storage key: ${fallbackKey}`);
        }
      }
      
      const persistedState = stored ? JSON.parse(stored) : {};
      
      // Merge layout-defined state with persisted state
      // Persisted state takes precedence (user-modified values)
      const mergedState = layout.state ? { ...layout.state, ...persistedState } : persistedState;
      
      logger.debug(`[EngineRenderer] Loading state from localStorage (${storageKey}):`, mergedState);
      return mergedState;
    } catch (error) {
      console.warn('[EngineRenderer] Failed to load state from localStorage:', error);
      // Return layout-defined state as fallback
      return layout.state || {};
    }
  };

  /**
   * Interpolate template strings like "{{state.cart.items}}" with actual state values
   */
  const interpolateValue = (value: unknown, state: Record<string, unknown>): unknown => {
    if (typeof value !== 'string') {
      return value;
    }

    // Match {{...}} patterns
    const templateRegex = /\{\{(.+?)\}\}/g;
    if (!templateRegex.test(value)) {
      return value;
    }

    // If entire string is a template, return the actual value
    const fullMatch = value.match(/^\{\{(.+?)\}\}$/);
    if (fullMatch) {
      const path = fullMatch[1].trim();
      return getNestedValue(state, path);
    }

    // Otherwise, perform string interpolation
    return value.replace(templateRegex, (_match, path) => {
      const val = getNestedValue(state, path.trim());
      return String(val ?? '');
    });
  };

  /**
   * Get value from nested object using dot notation (e.g., "state.cart.items")
   */
  const getNestedValue = (obj: unknown, path: string): unknown => {
    // Handle "state." prefix - it refers to the current state object
    let actualPath = path;
    if (path.startsWith('state.')) {
      actualPath = path.slice(6); // Remove "state." prefix
    }
    
    const result = actualPath.split('.').reduce((current, key) => {
      if (current === null || current === undefined) return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj);
    
    if (result === undefined && path.includes('checkout-form')) {
      console.log(`[EngineRenderer] getNestedValue("${path}") -> undefined. State keys:`, Object.keys(obj as Record<string, unknown>));
    }
    
    return result;
  };

  /**
   * Recursively interpolate all values in an object
   */
  const interpolateObject = (
    obj: Record<string, unknown>,
    state: Record<string, unknown>
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = interpolateValue(value, state);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item =>
          typeof item === 'object' && item !== null
            ? interpolateObject(item as Record<string, unknown>, state)
            : interpolateValue(item, state)
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = interpolateObject(value as Record<string, unknown>, state);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  // State management for form data and other engine state
  const [engineState, setEngineState] = useState<Record<string, unknown>>(loadInitialState);
  
  // State for step layout (when StepContent component is present)
  const [stepLayout, setStepLayout] = useState<Layout | null>(null);
  const [stepLayoutError, setStepLayoutError] = useState<Error | null>(null);

  // Load step layout if StepContent component is present and we have a stepId
  useEffect(() => {
    const hasStepContent = layout.sections.some(s => s.component === 'StepContent');
    
    if (hasStepContent && stepId) {
      const loadStepLayout = async () => {
        try {
          logger.debug(`[EngineRenderer] Loading step layout for: ${stepId}`);
          // StepContent needs to load the step-specific layout
          // We'll use a simpler approach here - just load from steps folder
          const stepLayoutData = await getStepLayouts(slug, stepId, variant);
          // We'll use the desktop layout as the base
          setStepLayout(stepLayoutData.desktop);
          setStepLayoutError(null);
        } catch (err) {
          logger.error(`[EngineRenderer] Failed to load step layout for ${stepId}:`, err);
          setStepLayoutError(err as Error);
        }
      };
      
      loadStepLayout();
    }
  }, [slug, stepId, variant, layout.sections]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(engineState));
      logger.debug(`[EngineRenderer] State saved to localStorage (${storageKey}):`, engineState);
    } catch (error) {
      console.warn('[EngineRenderer] Failed to save state to localStorage:', error);
    }
  }, [engineState, storageKey]);

  // Debug logging for state on each page load
  useEffect(() => {
    logger.debug(`[EngineRenderer] Page loaded - Step: ${stepId}, State:`, engineState);
    console.log(`[DEBUG] Page loaded - Step: ${stepId}, State:`, engineState);
  }, [stepId, engineState]);

  // Create action dispatcher with merged context
  const dispatcher = useMemo(() => {
    const defaultContext: ActionContext = {
      navigate: (stepId: string) => {
        // Map to existing funnel navigation - simplified since we removed legacy funnelActions
        console.warn('[EngineRenderer] navigate called but no funnel context:', stepId);
      },
      getState: (key?: string) => {
        // Return specific state or all state
        if (key) {
          return engineState[key];
        }
        return engineState;
      },
      setState: (key: string, value: unknown, merge = true) => {
        // Update state with optional merge
        setEngineState(prevState => ({
          ...prevState,
          [key]: merge && typeof prevState[key] === 'object' && typeof value === 'object'
            ? { ...prevState[key] as object, ...value as object }
            : value,
        }));
        console.log(`[EngineRenderer] setState - ${key}:`, value);
      },
      formData: engineState.contactForm as Record<string, unknown> || {},
      variant, // Add variant to context
      ...actionContext,
    };

    return createActionDispatcher(defaultContext);
  }, [engineState, actionContext, variant]);

  return (
    <Suspense fallback={<div className="text-center p-8">Loading components...</div>}>
      {layout.sections.map((section, index) => {
        // Handle StepContent as a special engine component
        if (section.component === 'StepContent') {
          if (stepLayoutError) {
            return (
              <div
                key={index}
                className="fallback p-4 border-2 border-yellow-300 bg-yellow-50 text-yellow-700 rounded"
              >
                <p className="font-semibold">Step content unavailable</p>
                <p className="text-sm mt-1">{stepLayoutError.message}</p>
              </div>
            );
          }

          if (!stepLayout) {
            return (
              <div key={index} className="text-center p-8">
                Loading step content...
              </div>
            );
          }

          // Render step layout sections in place of StepContent
          return (
            <React.Fragment key={index}>
              {stepLayout.sections.map((stepSection, stepIndex) => {
                const Component = ComponentMap[stepSection.component];
                if (!Component) {
                  return (
                    <div
                      key={stepIndex}
                      className="fallback p-4 border-2 border-red-300 bg-red-50 text-red-700 rounded"
                    >
                      Unknown component: {stepSection.component}
                    </div>
                  );
                }

                const componentProps = {
                  ...(stepSection.props ? interpolateObject(stepSection.props as Record<string, unknown>, engineState) : {}),
                  dispatcher,
                  actions: stepSection.actions as Record<string, Action> | undefined,
                  state: engineState,
                  slug,
                  stepId,
                  variant,
                };

                const component = <Component key={stepIndex} {...componentProps} />;

                // Wrap with ID if section has an id (enables anchor link scrolling)
                if (stepSection.id) {
                  return (
                    <div key={stepIndex} id={stepSection.id}>
                      {component}
                    </div>
                  );
                }

                return component;
              })}
            </React.Fragment>
          );
        }

        // Regular component rendering
        const Component = ComponentMap[section.component];
        if (!Component) {
          return (
            <div key={index} className="fallback p-4 border-2 border-red-300 bg-red-50 text-red-700 rounded">
              Unknown component: {section.component}
            </div>
          );
        }

        // Pass new action system props
        const componentProps = {
          ...(section.props ? interpolateObject(section.props as Record<string, unknown>, engineState) : {}),
          dispatcher,
          actions: section.actions as Record<string, Action> | undefined,
          state: engineState, // Pass current state for interpolation
          slug, // Pass slug for components that need it
          stepId, // Pass stepId for components that need it
          variant, // Pass variant for components that need it
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
      })}
    </Suspense>
  );
};

export default EngineRenderer;