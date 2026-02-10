import React, { useState } from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface SimpleCTAProps {
  text: string;
  action?: 'approve' | 'decline'; // Legacy support
  onAction?: (action: 'approve' | 'decline') => void; // Legacy support
  
  // New action system
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
}

const SimpleCTA: React.FC<SimpleCTAProps> = ({ 
  text, 
  action = 'approve',
  onAction, 
  dispatcher,
  actions,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    // New action system takes precedence
    if (dispatcher && actions) {
      try {
        setIsLoading(true);

        // First execute the named action (e.g., 'approve', 'reject')
        const primaryActionName = action || 'approve';
        if (actions[primaryActionName]) {
          const result = await dispatcher.dispatchNamed(primaryActionName, actions);
          if (!result.success) {
            throw result.error || new Error('Action failed');
          }
        }

        // Then execute onClick action if defined
        if (actions.onClick) {
          await dispatcher.dispatch(actions.onClick);
        }

        // Execute default action as fallback
        if (!actions[primaryActionName] && actions.default) {
          await dispatcher.dispatch(actions.default);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Action failed');
        console.error('[SimpleCTA] Action error:', err);
      } finally {
        setIsLoading(false);
      }
    } 
    // Fallback to legacy system
    else if (onAction) {
      onAction(action);
    }
  };

  return (
    <div className="flex flex-col items-center p-8">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          fontFamily: 'var(--font-body)',
          borderRadius: 'var(--radius-md, 8px)',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
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