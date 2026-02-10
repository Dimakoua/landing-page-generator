import React, { Suspense, useEffect } from 'react';
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
    fullscreen: 'max-w-6xl max-h-[95vh]'
  };

  // Prevent body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCloseButton) {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showCloseButton]);

  const handleClose = () => {
    // Navigate back to hero or close popup
    if (dispatcher) {
      dispatcher.dispatch({
        type: 'navigate',
        url: '/hero'
      });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (e.target === e.currentTarget && showCloseButton) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-20 backdrop-blur-sm transition-opacity duration-300" onClick={handleBackdropClick}>
      <div className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200 transform transition-transform duration-300 ease-out`}>
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <div className="pr-12">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Close popup"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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