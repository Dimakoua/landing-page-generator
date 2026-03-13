import { useContext } from 'react';

import { EngineContext } from './EngineContext';

export function useEngine() {
  const engine = useContext(EngineContext);

  if (!engine) {
    throw new Error('useEngine must be used inside an EngineProvider.');
  }

  return engine;
}
