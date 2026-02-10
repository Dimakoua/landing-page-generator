import React, { useState } from 'react';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';

interface CTAAction {
  label: string;
  action: Action;
}

interface SimpleCTAProps {
  title?: string;
  subtitle?: string;
  text?: string;
  primaryAction?: CTAAction;
  secondaryAction?: CTAAction;
  // Action system
  dispatcher?: ActionDispatcher;
}

const SimpleCTA: React.FC<SimpleCTAProps> = ({
  title,
  subtitle,
  text,
  primaryAction,
  secondaryAction,
  dispatcher,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: Action) => {
    if (!dispatcher) {
      console.warn('[SimpleCTA] No dispatcher provided');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await dispatcher.dispatch(action);
      if (!result.success) {
        throw result.error || new Error('Action failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setError(errorMessage);
      console.error('[SimpleCTA] Action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrimaryClick = () => {
    if (primaryAction?.action) {
      handleAction(primaryAction.action);
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryAction?.action) {
      handleAction(secondaryAction.action);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && (
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {text && !title && (
          <p className="text-lg md:text-xl text-gray-700 mb-10">
            {text}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {primaryAction && (
            <button
              onClick={handlePrimaryClick}
              disabled={isLoading}
              className="px-8 py-4 md:px-10 md:py-5 rounded-lg font-semibold text-base md:text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Loading...' : primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={handleSecondaryClick}
              disabled={isLoading}
              className="px-8 py-4 md:px-10 md:py-5 rounded-lg font-semibold text-base md:text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300"
            >
              {isLoading ? 'Loading...' : secondaryAction.label}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-6 px-4 py-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>
    </section>
  );
};

export default SimpleCTA;