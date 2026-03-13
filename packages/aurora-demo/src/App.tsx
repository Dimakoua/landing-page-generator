import { EngineProvider, LandingRuntime } from '@lp-factory/core';

import { engine } from './engine';

export function App() {
  const slug = window.location.pathname.split('/').filter(Boolean)[0] || 'aurora-desk-lamp';

  return (
    <EngineProvider engine={engine}>
      <LandingRuntime slug={slug} />
    </EngineProvider>
  );
}
