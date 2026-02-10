import React, { Suspense } from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';
import ComponentMap from '../../registry/ComponentMap';

interface PopupProps {
  title: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  sections: any[];
  // Action system
  dispatcher?: ActionDispatcher;
  state?: Record<string, unknown>;
}

const Popup: React.FC<PopupProps> = ({
  title,
  subtitle,
  size = 'medium',
  showCloseButton = true,
  sections,
  dispatcher,
  state
}) => {
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    fullscreen: 'max-w-full h-full'
  };

  const handleClose = () => {
    // Navigate back to hero or close popup
    if (dispatcher) {
      dispatcher.dispatch({
        type: 'navigate',
        url: '/hero'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
            {sections.map((section, index) => {
              const Component = ComponentMap[section.component];
              if (!Component) {
                return (
                  <div key={index} className="fallback p-4 border-2 border-red-300 bg-red-50 text-red-700 rounded">
                    Unknown component: {section.component}
                  </div>
                );
              }

              // Pass action system props and state
              const componentProps = {
                ...section.props,
                dispatcher,
                actions: section.actions as Record<string, Action> | undefined,
                state,
              };

              return <Component key={index} {...componentProps} />;
            })}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Popup;