# Error Tracking Providers

This document explains how to enable and configure error tracking providers in the project (Console, Noop, Composite, Sentry).

## Do I need to install anything?
- Yes — the `SentryProvider` in `src/utils/errorTracking/providers/sentry.ts` is a *wrapper/stub*.
- To use Sentry in production/staging install the official SDK:

  npm install @sentry/react @sentry/tracing

  (or `yarn add @sentry/react @sentry/tracing` / `pnpm add @sentry/react @sentry/tracing`)

- No additional packages are required for `ConsoleProvider`, `NoopProvider`, or `CompositeProvider`.

## Environment variables
- Vite-friendly env vars (add them to your deployment/CI):
  - `VITE_SENTRY_DSN` — Sentry DSN (required to enable Sentry)
  - `VITE_SENTRY_TRACES_SAMPLE_RATE` — (optional) e.g. `0.1`
  - `VITE_DISABLE_ERROR_TRACKING` — (optional) `true` to force `NoopProvider`

> Security: Treat DSNs/configs like configuration. Do not commit secrets to source control.

## Quick start (recommended)
1. Install packages: `npm install @sentry/react @sentry/tracing`
2. Initialize Sentry and wire the provider in `src/main.tsx` or `src/App.tsx`:

```ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { setErrorTracker, ConsoleProvider, CompositeProvider, SentryProvider } from '@/utils/errorTracking';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0),
    environment: import.meta.env.MODE,
  });

  // Combine Console + Sentry so we keep local logs and remote errors
  setErrorTracker(new CompositeProvider([new ConsoleProvider(), new SentryProvider(Sentry)]));
} else {
  // Dev / fallback
  setErrorTracker(new ConsoleProvider());
}
```

## Using providers in different environments
- Development: `ConsoleProvider` (default) or `NoopProvider` to silence output.
- Staging/Production: `CompositeProvider([ConsoleProvider, SentryProvider])`.
- Tests: swap providers with `setErrorTracker()` / `resetErrorTracker()` (see tests in `src/__tests__/utils/errorTracking.test.ts`).

## Example composable / factory (recommended)
Add a small factory to centralize provider selection:

```ts
import * as Sentry from '@sentry/react';

export function createErrorTracker() {
  if (import.meta.env.VITE_DISABLE_ERROR_TRACKING === 'true') return new NoopProvider();

  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, integrations: [new BrowserTracing()] });
    return new CompositeProvider([new ConsoleProvider(), new SentryProvider(Sentry)]);
  }

  return new ConsoleProvider();
}

// usage: setErrorTracker(createErrorTracker());
```

## Testing notes
- Unit tests should use `NoopProvider` or a mocked provider via `setErrorTracker(mock)`.
- See `src/__tests__/utils/errorTracking.test.ts` for examples.

## Where the code lives
- Providers: `src/utils/errorTracking/providers/*`
- Public API: `src/utils/errorTracking/index.ts`
- Tests: `src/__tests__/utils/errorTracking*.test.ts`

## Next steps (optional)
- Replace `SentryProvider` `any` type with typed SDK wrapper.
- Add integration test that validates Sentry init + Composite wiring (requires DSN in CI secrets).
