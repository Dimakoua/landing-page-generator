import { getProjectConfig } from './engine/resolver';
import ThemeInjector from './engine/ThemeInjector';
import { useFunnel } from './engine/useFunnel';

function App() {
  try {
    const { theme, flow } = getProjectConfig('sample');
    const { currentStepId, goToNext, isPopup } = useFunnel(flow);

    return (
      <>
        <ThemeInjector theme={theme} />
        <div className="min-h-screen bg-white p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Landing Page Engine Test
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Theme variables applied from JSON:
          </p>
          <div className="space-y-4">
            <div
              className="w-32 h-32 rounded-lg border-2"
              style={{
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-secondary)',
              }}
            >
              Primary Color
            </div>
            <p style={{ fontFamily: 'var(--font-heading)' }}>
              This text uses the heading font.
            </p>
            <p style={{ fontFamily: 'var(--font-body)' }}>
              This text uses the body font.
            </p>
          </div>
          <div className="mt-8 p-4 border rounded">
            <h2 className="text-2xl font-semibold mb-2">Funnel State</h2>
            <p>Current Step: <strong>{currentStepId}</strong></p>
            <p>Is Popup: <strong>{isPopup ? 'Yes' : 'No'}</strong></p>
            <button
              onClick={() => goToNext()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Next (Approve)
            </button>
            <button
              onClick={() => goToNext('decline')}
              className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Go to Next (Decline)
            </button>
          </div>
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{(error as Error).message}</p>
        </div>
      </div>
    );
  }
}

export default App;
