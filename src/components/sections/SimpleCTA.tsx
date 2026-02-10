import React, { useState } from 'react';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';
import type { Action } from '../../schemas/actions';

interface SimpleCTAProps {
  text: string;

  // Action system
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
}

const SimpleCTA: React.FC<SimpleCTAProps> = ({
  text,
  dispatcher,
  actions,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!dispatcher || !actions) {
      console.warn('[SimpleCTA] No dispatcher or actions provided');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Execute primary action (default to 'approve' if not specified)
      const primaryActionName = 'approve';
      if (actions[primaryActionName]) {
        const result = await dispatcher.dispatchNamed(primaryActionName, actions);
        if (!result.success) {
          throw result.error || new Error('Action failed');
        }
      }

      // Execute onClick action if defined
      if (actions.onClick) {
        await dispatcher.dispatch(actions.onClick);
      }

      // Execute default action as fallback
      if (!actions[primaryActionName] && actions.default) {
        await dispatcher.dispatch(actions.default);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setError(errorMessage);
      console.error('[SimpleCTA] Action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <button
        onClick={handleClick}
        disabled={isLoading || !dispatcher || !actions}
        className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          fontFamily: 'var(--font-body)',
          borderRadius: 'var(--radius-md, 8px)',
        }}
        onMouseEnter={(e) => {
          if (!isLoading && dispatcher && actions) {
            e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary)';
        }}
      >
        {isLoading ? 'Loading...' : text}
      </button>

      {error && (
        <div className="mt-4 px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default SimpleCTA;