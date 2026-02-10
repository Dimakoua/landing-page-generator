// Production logging utility
const isDev = import.meta.env.DEV;

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDev) console.log(`[DEBUG] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
};