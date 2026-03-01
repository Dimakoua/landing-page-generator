import React from 'react';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';
import type { LayoutSection } from '../../schemas';
import { renderSection } from '../../engine/utils/renderSection';
import { useInterpolation } from '../../engine/hooks/useInterpolation';

interface WizardLayoutProps {
  sections?: LayoutSection[];
  step?: number;
  totalSteps?: number;
  title: string;
  dispatcher: ActionDispatcher;
  actions?: Record<string, Action>;
  state: Record<string, unknown>;
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
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Landing Page AI Wizard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {title}
          </p>
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
