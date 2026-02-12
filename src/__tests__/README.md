# Engine Tests

This directory contains unit tests for the landing page engine core functionality.

## Structure

```
__tests__/
├── engine/              # Engine core tests
│   ├── ActionDispatcher.test.ts    # All 15 action types
│   ├── EngineRenderer.test.tsx     # Component rendering
│   ├── LayoutResolver.test.tsx     # Mobile/desktop layout resolution
│   ├── ProjectResolver.test.tsx    # JSON loading + validation
│   ├── ThemeInjector.test.tsx      # CSS variable injection
│   └── LandingPage.test.tsx        # Full page integration
├── actions/             # Individual action tests
│   ├── AnalyticsAction.test.ts
│   ├── ApiAction.test.ts
│   ├── CartAction.test.ts
│   ├── NavigateAction.test.ts
│   └── ... (15+ action types)
└── components/          # Component tests
    ├── sections/        # Section component tests
    │   ├── Hero.test.tsx
    │   ├── SimpleCTA.test.tsx
    │   ├── Features.test.tsx
    │   └── ...
    └── forms/           # Form component tests
```

## Test Coverage Goals

Per methodology.md §7:
- **Target:** ≥80% coverage on statements and branches
- **Priority:** Engine and registry (ActionDispatcher, ProjectResolver, ThemeInjector)
- **Component tests:** Focus on props, actions, and rendering

## Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage

# Run with UI (visual test runner)
npm run test:ui
```

## Writing Tests

See test setup in `/src/test/setup.ts` for available utilities and mocks.

Example test structure:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionDispatcher } from '@/engine/ActionDispatcher';

describe('ActionDispatcher', () => {
  it('should execute navigate action', async () => {
    // Test implementation
  });
});
```
