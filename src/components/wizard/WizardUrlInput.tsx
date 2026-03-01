import React, { useState } from 'react';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';

interface WizardUrlInputProps {
  placeholder?: string;
  buttonLabel?: string;
  dispatcher?: ActionDispatcher;
}

const WizardUrlInput: React.FC<WizardUrlInputProps> = ({
  placeholder = "https://example.com",
  buttonLabel = "Continue",
  dispatcher
}) => {
  const [url, setUrl] = useState('');
  const { loading, dispatchWithLoading } = useActionDispatch(dispatcher);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !dispatcher) return;

    // Plan:
    // 1. Store the URL in state
    // 2. Call the scrape API
    // 3. Store result in state
    // 4. Navigate to 'scraping' step (which will show status)
    
    // For simplicity in this scaffolding task, we'll chain these actions
    await dispatchWithLoading('submit', {
      type: 'chain',
      actions: [
        {
          type: 'setState',
          key: 'wizard_sourceUrl',
          value: url,
          merge: false
        },
        {
          type: 'post',
          url: 'http://localhost:3001/api/dev/scrape',
          payload: { url },
          stateKey: 'wizard_scrapeResult',
          errorStateKey: 'wizard_scrapeError'
        },
        {
          type: 'navigate',
          url: 'scraping'
        }
      ]
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          Landing Page URL
        </label>
        <div className="mt-1">
          <input
            id="url"
            name="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={placeholder}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading.submit}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading.submit ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading.submit ? (
            <>
              <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
              Processing...
            </>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </form>
  );
};

export default WizardUrlInput;
