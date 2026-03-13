import { createContext } from 'react';

import type { EngineRuntime } from '../contracts';

export const EngineContext = createContext<EngineRuntime | null>(null);
