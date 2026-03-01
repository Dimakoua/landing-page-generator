import React, { useEffect, useState, useRef } from 'react';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';

interface Task {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
}

interface GenerationSession {
  id: string;
  status: 'processing' | 'ready' | 'complete' | 'failed';
  tasks: Task[];
  result?: { slug: string; path: string };
  error?: string;
}

interface WizardGenerationStatusProps {
  dispatcher?: ActionDispatcher;
  state?: any;
}

const GENERATION_TIPS = [
  "Optimizing image assets for ultra-fast loading...",
  "Mapping Tailwind utilities to your brand tokens...",
  "Ensuring all components follow the 'Pure & Dumb' pattern...",
  "Injecting ActionDispatcher context for interactive elements...",
  "Validating JSON schema against engine standards...",
  "Generating responsive mobile and desktop layouts...",
  "Fine-tuning CSS variables for consistent theming...",
  "Did you know? High-speed landing pages can increase conversion by 20%!",
  "Pro tip: Use the 'chain' action to sequence complex user journeys.",
  "AI is now writing custom React code for your missed sections..."
];

const WizardGenerationStatus: React.FC<WizardGenerationStatusProps> = ({
  dispatcher,
  state
}) => {
  const [session, setSession] = useState<GenerationSession | null>(null);
  const [currentTip, setCurrentTip] = useState(0);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const generationStarted = useRef(false);

  const finalSelection = state?.wizard_finalSelection;
  const analysisResult = state?.wizard_analysisResult;
  const scrapeResult = state?.wizard_scrapeResult;
  const sessionIdInState = state?.wizard_sessionId;

  // Cycle tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % GENERATION_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Poll status helper
  const pollStatus = (sessionId: string) => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    
    pollInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/dev/generate/status/${sessionId}`);
        if (!response.ok) throw new Error('Session not found');
        
        const data: GenerationSession = await response.json();
        setSession(data);

        if (data.status === 'ready' && data.result?.path) {
          console.log(`[Wizard] Generation ready! Redirecting to ${data.result.path}...`);
          if (pollInterval.current) clearInterval(pollInterval.current);
          window.location.href = data.result.path;
          return;
        }

        if (data.status === 'complete' || data.status === 'failed') {
          if (pollInterval.current) clearInterval(pollInterval.current);
          
          // If complete, we keep the session in UI but we could clear the state ID 
          // to prevent re-triggering if user navigates back and forth
          if (data.status === 'complete' && dispatcher) {
            dispatcher.dispatch({ type: 'setState', key: 'wizard_sessionId', value: null });
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        if (pollInterval.current) clearInterval(pollInterval.current);
      }
    }, 1000);
  };

  const startGeneration = async () => {
    if (!dispatcher) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/dev/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: analysisResult.theme,
          mappings: finalSelection,
          sourceUrl: scrapeResult.sourceUrl,
          sessionId: sessionIdInState // Pass existing session ID if available
        })
      });
      const data = await response.json();
      if (data.sessionId) {
        // Store session ID in engine state (persists across reloads)
        dispatcher.dispatch({ type: 'setState', key: 'wizard_sessionId', value: data.sessionId });
        pollStatus(data.sessionId);
      }
    } catch (err) {
      console.error('Failed to start generation:', err);
    }
  };

  // Initial call to start or resume generation
  useEffect(() => {
    if (finalSelection && !generationStarted.current) {
      if (sessionIdInState) {
        console.log(`[Wizard] Resuming generation session: ${sessionIdInState}`);
        generationStarted.current = true;
        pollStatus(sessionIdInState);
      } else if (!session) {
        console.log('[Wizard] Starting new generation session');
        generationStarted.current = true;
        startGeneration();
      }
    }
  }, [finalSelection, sessionIdInState]);

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const handleViewPage = () => {
    if (session?.result?.path) {
      window.location.href = session.result.path;
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done': return <span className="material-icons text-green-500 text-sm">check_circle</span>;
      case 'processing': return <span className="material-icons text-blue-500 text-sm animate-spin">refresh</span>;
      case 'failed': return <span className="material-icons text-red-500 text-sm">error</span>;
      default: return <span className="material-icons text-gray-300 text-sm">radio_button_unchecked</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      {(!session || session.status === 'processing') ? (
        <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-700">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-icons text-blue-600 text-2xl animate-pulse">auto_fix_high</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Generating Landing Page</h3>
            <p className="text-sm text-gray-500">Processing {finalSelection?.length || 0} sections sequentially to respect API limits.</p>
          </div>

          {/* Task Queue UI */}
          <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Generation Queue</span>
              {session && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  {session.tasks.filter(t => t.status === 'done').length} / {session.tasks.length}
                </span>
              )}
            </div>
            <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {session?.tasks.map(task => (
                <li key={task.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <span className={`text-sm ${task.status === 'processing' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                    {task.name}
                  </span>
                  {getStatusIcon(task.status)}
                </li>
              ))}
              {!session && <li className="px-4 py-8 text-center text-gray-400 text-sm italic">Initializing queue...</li>}
            </ul>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 w-full transition-all duration-500 min-h-[100px] flex flex-col justify-center text-center">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Pro Tip</p>
            <p className="text-blue-800 font-medium italic">"{GENERATION_TIPS[currentTip]}"</p>
          </div>
        </div>
      ) : session.status === 'failed' ? (
        <div className="text-center py-8 animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full text-red-600 mb-6">
            <span className="material-icons text-4xl">warning_amber</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Generation Failed</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">{session.error}</p>
          <button
            onClick={() => { generationStarted.current = false; startGeneration(); }}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Retry Generation
          </button>
        </div>
      ) : (
        <div className="text-center py-8 animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full text-green-600 mb-6">
            <span className="material-icons text-4xl">verified</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Generation Complete!</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Your landing page is ready. All components and configurations have been written to disk.
          </p>
          <div className="flex flex-col space-y-4 items-center">
            <button
              onClick={handleViewPage}
              className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all transform hover:-translate-y-1 shadow-xl"
            >
              Launch Landing Page
            </button>
            <p className="text-xs text-gray-400">
              Generated slug: <code>{session.result?.slug}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardGenerationStatus;
