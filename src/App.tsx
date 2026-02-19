import React, { Suspense } from 'react';
import LandingPage, { ErrorFallback } from './engine/LandingPage';
import { setErrorTracker, ConsoleProvider } from '@/utils/errorTracking';
import { logger } from './utils/logger';

/**
 * Error Boundary - React error boundary for graceful error handling
 */
// Initialize a default (console) provider early so errors are always captured
setErrorTracker(new ConsoleProvider());

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    logger.error('Error boundary caught:', error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} slug="unknown" />;
    }

    return this.props.children;
  }
}

function App() {
  // Get slug from URL pathname
  // e.g., /sample → 'sample'
  // e.g., /my-landing → 'my-landing'
  const slug = window.location.pathname
    .split('/')
    .filter(Boolean)
    .shift() || 'sample';

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <LandingPage slug={slug} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * LoadingScreen - Global loading state display
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading landing page...</p>
      </div>
    </div>
  );
}

export default App;
