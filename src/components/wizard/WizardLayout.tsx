import React, { useCallback } from 'react';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';
import type { LayoutSection } from '../../schemas';
import { renderSection } from '../../engine/utils/renderSection';
import { useInterpolation } from '../../engine/hooks/useInterpolation';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';

interface WizardLayoutProps {
  sections?: LayoutSection[];
  step?: number;
  totalSteps?: number;
  title: string;
  dispatcher: ActionDispatcher;
  actions?: Record<string, Action>;
  state: Record<string, any>;
  slug: string;
  stepId?: string;
  variant?: string;
}

const WizardLayout: React.FC<WizardLayoutProps> = (props) => {
  const { 
    sections = [],
    step = 1, 
    totalSteps = 6,
    title,
    dispatcher,
    state,
    slug,
    stepId,
    variant,
  } = props;

  const { interpolateObject } = useInterpolation();
  const { dispatchWithLoading } = useActionDispatch(dispatcher);
  const progress = (step / totalSteps) * 100;

  const handleReset = useCallback(async () => {
    if (!dispatcher) return;

    // Identify all wizard-related state keys to clear
    const wizardKeys = Object.keys(state).filter(key => key.startsWith('wizard_'));
    
    const clearActions = wizardKeys.map(key => ({
      type: 'setState',
      key,
      value: null,
      merge: false
    }));

    await dispatchWithLoading('reset', {
      type: 'chain',
      actions: [
        ...clearActions,
        {
          type: 'navigate',
          url: 'input-url'
        }
      ]
    } as any);

    // Hard refresh to ensure all local component states are also reset
    window.location.reload();
  }, [dispatcher, state, dispatchWithLoading]);

  const hasSession = Object.keys(state).some(key => key.startsWith('wizard_') && state[key] !== null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="relative">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Landing Page AI Wizard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {title}
          </p>
          
          {hasSession && (
            <div className="absolute top-0 right-0">
              <button
                onClick={handleReset}
                title="Reset Wizard Session"
                className="inline-flex items-center p-2 border border-gray-300 rounded-full shadow-sm text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <span className="material-icons text-sm">refresh</span>
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Step {step} of {totalSteps}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div 
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
            ></div>
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
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
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;
