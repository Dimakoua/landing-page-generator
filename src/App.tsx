import { getProjectConfig } from './engine/resolver';
import ThemeInjector from './engine/ThemeInjector';

function App() {
  try {
    const { theme } = getProjectConfig('sample');

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
