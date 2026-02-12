# Testing Setup - Quick Reference

## ✅ Completed Setup

### 1. Dependencies Installed
- ✅ `vitest` - Test runner
- ✅ `@testing-library/react` - React component testing utilities
- ✅ `@testing-library/jest-dom` - DOM matchers
- ✅ `@testing-library/user-event` - User interaction simulation
- ✅ `jsdom` - DOM environment for tests
- ✅ `@vitest/ui` - Visual test runner UI

### 2. Configuration Files
- ✅ `vitest.config.ts` - Test configuration with coverage thresholds (70%)
- ✅ `src/test/setup.ts` - Test setup with mocks for matchMedia and IntersectionObserver

### 3. NPM Scripts
```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once (CI mode)
npm run test:coverage # Run with coverage report
npm run test:ui       # Run with visual UI
```

### 4. Test Directory Structure
```
src/__tests__/
├── README.md                    # Testing documentation
├── engine/                      # Engine core tests
│   └── .gitkeep
├── actions/                     # Action type tests
│   └── .gitkeep
└── components/                  # Component tests
    ├── sections/
    │   └── .gitkeep
    └── forms/
        └── .gitkeep
```

## 🎯 Next Steps (Add Actual Tests)

### Priority 1: Engine Core Tests
Target: `/src/__tests__/engine/`

1. **ActionDispatcher.test.ts** - Test all 15 action types
2. **ProjectResolver.test.tsx** - Test JSON loading and validation
3. **ThemeInjector.test.tsx** - Test CSS variable injection
4. **LayoutResolver.test.tsx** - Test mobile/desktop resolution
5. **EngineRenderer.test.tsx** - Test component rendering

### Priority 2: Action Tests
Target: `/src/__tests__/actions/`

Test each action type individually:
- NavigateAction, ApiAction, AnalyticsAction, etc.

### Priority 3: Component Tests
Target: `/src/__tests__/components/`

Test key components:
- Hero, SimpleCTA, Features, Pricing, etc.

## 📊 Coverage Goals

Per methodology.md §7:
- **Target:** ≥80% coverage on statements and branches
- **Current threshold:** 70% (will fail CI if below)
- **Focus areas:** Engine and registry first

## 🔍 Example Test Structure

```typescript
// src/__tests__/engine/ActionDispatcher.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ActionDispatcher } from '@/engine/ActionDispatcher';

describe('ActionDispatcher', () => {
  describe('navigate action', () => {
    it('should navigate to specified URL', async () => {
      const mockNavigate = vi.fn();
      const dispatcher = new ActionDispatcher({ navigate: mockNavigate });
      
      await dispatcher.execute({
        type: 'navigate',
        url: '/success'
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/success');
    });
  });
  
  // Add 14 more action type tests...
});
```

## 🚀 Running Tests

The test runner is ready to use:

1. **Development mode** (watch for changes):
   ```bash
   npm test
   ```

2. **CI mode** (run once):
   ```bash
   npm run test:run
   ```

3. **With coverage** (generates HTML report):
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

4. **Visual UI** (helpful for debugging):
   ```bash
   npm run test:ui
   ```

## ⚙️ Configuration Details

### Vitest Config (`vitest.config.ts`)
- **Environment:** jsdom (simulates browser)
- **Setup file:** `src/test/setup.ts`
- **Coverage provider:** v8
- **Coverage thresholds:** 70% for all metrics
- **Path alias:** `@` → `./src`

### Test Setup (`src/test/setup.ts`)
- Auto-cleanup after each test
- jest-dom matchers extended
- window.matchMedia mocked (for react-responsive)
- IntersectionObserver mocked

## 📝 Status

**Setup:** ✅ Complete  
**Tests written:** ⚪ 0/20+ (ready to add)  
**Coverage:** N/A (no tests yet)

The testing infrastructure is fully configured and ready for test development!
