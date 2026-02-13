import React from 'react';
import type { Layout } from '../schemas';
import LayoutResolver from './LayoutResolver';

interface PopupOverlayProps {
  popupStepId: string | null;
  popupLayouts: { desktop: Layout; mobile: Layout } | null;
  slug: string;
  variant?: string;
  navigate: (stepId: string) => void;
  closePopup: () => void;
  engineState?: Record<string, unknown>;
  setEngineState?: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}

const PopupOverlay: React.FC<PopupOverlayProps> = ({ 
  popupStepId, 
  popupLayouts, 
  slug, 
  variant, 
  navigate, 
  closePopup,
  engineState,
  setEngineState
}) => {
  if (!popupStepId || !popupLayouts) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-auto">
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close popup"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <LayoutResolver 
          layouts={popupLayouts} 
          actionContext={{ navigate, closePopup }} 
          slug={slug} 
          stepId={popupStepId} 
          variant={variant}
          engineState={engineState}
          setEngineState={setEngineState}
        />
      </div>
    </div>
  );
};

export default PopupOverlay;
