import React from 'react';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';

interface WizardScraperStatusProps {
  dispatcher?: ActionDispatcher;
  state?: any;
}

const WizardScraperStatus: React.FC<WizardScraperStatusProps> = ({
  dispatcher,
  state
}) => {
  const { dispatchWithLoading } = useActionDispatch(dispatcher);
  const scrapeResult = state?.wizard_scrapeResult;
  const scrapeError = state?.wizard_scrapeError;

  const handleNext = () => {
    if (dispatcher) {
      dispatchWithLoading('next', { type: 'navigate', url: 'analysis' });
    }
  };

  const handleRetry = () => {
    if (dispatcher) {
      dispatchWithLoading('retry', { type: 'navigate', url: 'input-url' });
    }
  };

  return (
    <div className="text-center space-y-6">
      {!scrapeResult && !scrapeError ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-lg font-medium text-gray-900">Scraping the landing page...</p>
          <p className="text-sm text-gray-500">This may take a few moments as we wait for the page to fully hydrate.</p>
        </div>
      ) : scrapeError ? (
        <div className="py-12">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full text-red-600 mb-4">
            <span className="material-icons text-3xl">error_outline</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Scraping Failed</h3>
          <p className="text-sm text-gray-500 mb-6">{scrapeError.message || 'An unknown error occurred while scraping.'}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="py-12">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full text-green-600 mb-4">
            <span className="material-icons text-3xl">check_circle_outline</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Scraping Complete!</h3>
          <p className="text-sm text-gray-500 mb-6">
            Successfully identified {scrapeResult.sections?.length || 0} sections from "{scrapeResult.title}".
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Continue to Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardScraperStatus;
