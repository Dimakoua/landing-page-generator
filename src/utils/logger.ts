import { getErrorTracker } from "./errorTracking";

// Production logging utility
const isDev = import.meta.env.DEV;

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (!isDev) return;
    if (data === undefined) {
      console.log(`[DEBUG] ${message}`);
    } else {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: unknown) => {
    if (!isDev) return;
    if (data === undefined) {
      console.log(`[INFO] ${message}`);
    } else {
      console.log(`[INFO] ${message}`, data);
    }
  },
  warn: (message: string, data?: unknown) => {
    if (data === undefined) {
      console.warn(`[WARN] ${message}`);
    } else {
      console.warn(`[WARN] ${message}`, data);
    }
    getErrorTracker().captureMessage(message, 'warning', data ? { data } : undefined);
  },
  error: (message: string, error?: unknown) => {
    if (error === undefined) {
      console.error(`[ERROR] ${message}`);
      getErrorTracker().captureMessage(message, 'error');
    } else {
      console.error(`[ERROR] ${message}`, error);
      if (error instanceof Error) {
        getErrorTracker().captureError(error, { context: message });
      } else {
        getErrorTracker().captureMessage(message, 'error', { error });
      }
    }
  },
};