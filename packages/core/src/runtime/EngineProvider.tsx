import type { PropsWithChildren } from 'react';

import type { EngineRuntime } from '../contracts';
import { EngineContext } from './EngineContext';

interface EngineProviderProps extends PropsWithChildren {
  engine: EngineRuntime;
}

export function EngineProvider({ children, engine }: EngineProviderProps) {
  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
}
