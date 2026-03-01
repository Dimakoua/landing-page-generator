import React, { useEffect } from 'react';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';

interface WizardAnalysisResultProps {
  dispatcher?: ActionDispatcher;
  state?: any;
}

// Module-level lock to persist through StrictMode remounts
const executionLock = new Set<string>();

const WizardAnalysisResult: React.FC<WizardAnalysisResultProps> = ({
  dispatcher,
  state
}) => {
  const { loading, dispatchWithLoading } = useActionDispatch(dispatcher);
  const scrapeResult = state?.wizard_scrapeResult;
  const analysisResult = state?.wizard_analysisResult;
  const analysisError = state?.wizard_analysisError;

  const handleAnalyze = async () => {
    // Unique key for this specific analysis task
    const lockKey = `analyze-${scrapeResult?.sourceUrl}`;
    
    if (!dispatcher || !scrapeResult || executionLock.has(lockKey)) return;
    executionLock.add(lockKey);
    
    await dispatchWithLoading('analyze', {
      type: 'post',
      url: 'http://localhost:3001/api/dev/analyze',
      payload: scrapeResult,
      timeout: 300000,
      stateKey: 'wizard_analysisResult',
      errorStateKey: 'wizard_analysisError'
    } as any);
  };

  useEffect(() => {
    const lockKey = `analyze-${scrapeResult?.sourceUrl}`;
    if (scrapeResult && !analysisResult && !analysisError && !loading.analyze && !executionLock.has(lockKey)) {
      handleAnalyze();
    }
  }, [scrapeResult, analysisResult, analysisError, loading.analyze]);

  const handleNext = () => {
    if (dispatcher) {
      dispatchWithLoading('next', { type: 'navigate', url: 'selection' });
    }
  };

  return (
    <div className="text-center space-y-6">
      {!analysisResult && !analysisError ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-lg font-medium text-gray-900">Analyzing sections with AI...</p>
          <p className="text-sm text-gray-500">Gemma is decomposing the page structure and mapping it to engine components.</p>
        </div>
      ) : analysisError ? (
        <div className="py-12">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full text-red-600 mb-4">
            <span className="material-icons text-3xl">psychology_alt</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Analysis Failed</h3>
          <p className="text-sm text-gray-500 mb-6">{analysisError.message || 'An unknown error occurred during AI analysis.'}</p>
          <button
            onClick={handleAnalyze}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="py-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
            <span className="material-icons text-3xl">auto_awesome</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">AI Analysis Complete</h3>
          <p className="text-sm text-gray-500 mb-6">
            AI has suggested mappings for {analysisResult.mappings?.length || 0} sections.
          </p>
          <button
            onClick={handleNext}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Review Mappings
          </button>
        </div>
      )}
    </div>
  );
};

export default WizardAnalysisResult;
