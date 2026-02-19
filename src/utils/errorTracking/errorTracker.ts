import type { ErrorTracker } from './types';
import { ConsoleProvider } from './providers/console';

let tracker: ErrorTracker | null = null;

export function setErrorTracker(provider: ErrorTracker) {
  tracker = provider;
}

export function getErrorTracker(): ErrorTracker {
  if (!tracker) tracker = new ConsoleProvider();
  return tracker!;
}

export function resetErrorTracker() {
  tracker = null;
}
