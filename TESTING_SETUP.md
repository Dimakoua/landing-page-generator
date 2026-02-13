# Testing Setup - Quick Reference

## ✅ Completed Setup

### 1. Dependencies Installed
- ✅ `vitest` - Test runner
- ✅ `@testing-library/react` - React component testing utilities
- ✅ `@testing-library/jest-dom` - DOM matchers
- ✅ `@testing-library/user-event` - User interaction simulation
- ✅ `jsdom` - DOM environment for tests
- ✅ `@vitest/ui` - Visual test runner UI
- ✅ `@vitest/coverage-v8` - Coverage reporting

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
│   ├── ActionDispatcher.test.ts    ✅ COMPLETED (27 tests)
│   ├── ProjectResolver.test.tsx    ✅ COMPLETED (20 tests)
│   ├── ThemeInjector.test.tsx      ✅ COMPLETED (18 tests)
│   ├── LayoutResolver.test.tsx     ✅ COMPLETED (5 tests)
│   ├── EngineRenderer.test.tsx     ✅ COMPLETED (14 tests)
│   ├── LandingPage.test.tsx        ✅ COMPLETED (13 tests)
│   └── .gitkeep
├── actions/                     # Action type tests
│   └── .gitkeep
└── components/                  # Component tests
    ├── sections/
    │   └── .gitkeep
    └── forms/
        └── .gitkeep
```

## 🎯 Current Status

### Engine Core Tests: ✅ **COMPLETED**
### Action Layer Tests: ✅ **COMPLETED**
**Overall Coverage:** 
- Statements: 89.85%
- Branches: 78.96%
- Functions: 87.8%
- Lines: 90.42%

**Test Files Created (206 total tests - 97 engine + 109 action):**
1. **ActionDispatcher.test.ts** - 27 tests
   - All 15 action types (navigate, redirect, API, analytics, pixel, iframe, customHtml, setState, chain, parallel, conditional, delay, log, cart, closePopup)
   - Async action execution
   - Error handling and validation
   - Context methods (navigate, getState, setState)
   - **Coverage:** 97.36% statements, 96.15% branches

2. **Individual Action Tests** (`/src/__tests__/actions/`) - 109 tests
   - **NavigateAction.test.ts** - 4 tests (navigation with context)
   - **ClosePopupAction.test.ts** - 3 tests (popup closure)
   - **RedirectAction.test.ts** - 5 tests (window redirects _self/_blank)
   - **DelayAction.test.ts** - 5 tests (delayed actions with timers)
   - **LogAction.test.ts** - 6 tests (all log levels)
   - **SetStateAction.test.ts** - 6 tests (state management)
   - **AnalyticsAction.test.ts** - 8 tests (analytics providers)
   - **PixelAction.test.ts** - 6 tests (tracking pixels async/sync)
   - **IframeAction.test.ts** - 6 tests (iframe tracking with timeouts)
   - **CustomHtmlAction.test.ts** - 9 tests (HTML injection)
   - **ApiAction.test.ts** - 12 tests (HTTP requests with retries)
   - **ChainAction.test.ts** - 7 tests (sequential actions)
   - **ParallelAction.test.ts** - 8 tests (concurrent actions)
   - **ConditionalAction.test.ts** - 11 tests (conditional logic)
   - **CartAction.test.ts** - 13 tests (cart operations)
   - **Action Coverage:** 99.59% statements, 89.83% branches, 100% functions, 99.57% lines

3. **ProjectResolver.test.tsx** - 20 tests
   - Theme loading with variant support
   - Flow loading with variant support
   - Layout loading with variant support
   - Fallback mechanisms
   - Error handling
   - **Coverage:** Included in schemas (100%)

4. **ThemeInjector.test.tsx** - 18 tests
   - CSS variable injection for colors, fonts, spacing, radius
   - Multiple theme updates
   - Theme removal
   - **Coverage:** 100% all metrics

5. **LayoutResolver.test.tsx** - 5 tests
   - Desktop/mobile layout selection
   - Media query responsiveness
   - Variant passing
   - Action context handling
   - **Coverage:** 100% all metrics

6. **EngineRenderer.test.tsx** - 14 tests
   - Section rendering
   - Unknown component fallback
   - Action dispatcher creation
   - Props passing (dispatcher, actions, state)
   - localStorage state management
   - **Coverage:** 75.86% statements, 78.57% lines

7. **LandingPage.test.tsx** - 13 tests
   - Config loading with variants
   - Layout loading
   - URL parameter handling (variant, step)
   - Error handling
   - Theme injection
   - Action context with navigate
   - **Coverage:** 66.96% statements, 67.61% lines

### Next Steps:
1. **Component Tests** (`/src/__tests__/components/`)
   - Hero.test.tsx
   - SimpleCTA.test.tsx
   - Features.test.tsx
   - CheckoutForm.test.tsx ✅ COMPLETED (4 tests)
   - Confirmation.test.tsx ✅ COMPLETED (5 tests)
   - etc.

2. **Integration Tests**
   - Full landing page rendering
   - Action chains end-to-end
   - A/B variant switching
   - etc.

## 📊 Coverage Goals

Per methodology.md §7:
- **Target:** ≥80% coverage on statements and branches
- **Current threshold:** 70% (will fail CI if below)
- **Priority:** Engine and registry first ✅ **ACHIEVED**
- **Action Layer:** ✅ **ACHIEVED** (99.59% statements, 89.83% branches)
- **Overall:** 89.85% statements, 78.96% branches (target 85% branches for next phase)

## 🔍 Example Test Structure

See the completed test files for examples:
- `ActionDispatcher.test.ts` - Comprehensive mocking and routing tests
- `ProjectResolver.test.tsx` - Async loading and fallback logic
- `ThemeInjector.test.tsx` - React component testing with DOM mocking

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
**Engine Tests:** ✅ Complete (97 tests, ~78% coverage)  
**Action Tests:** ✅ Complete (109 tests, 99.59% coverage)  
**Test Results:** ✅ All 206 tests passing
**Component Tests:** ⚪ Ready to add (some completed: CheckoutForm 4 tests, Confirmation 5 tests)  
**Integration Tests:** ⚪ Ready to add

## 🔧 Key Testing Patterns Established

### 1. Mocking Strategy
- **Module mocks:** Use `vi.mock()` at top level with full implementation
- **Function mocks:** Re-create `vi.fn()` instances in `beforeEach` (not just reset)
- **Import mocking:** `import.meta.glob` requires complete module replacement

### 2. Schema Validation Testing
- Zod v4 adds default values during parsing (level: 'info', merge: true, etc.)
- Use `expect.objectContaining()` instead of exact matches
- Test validation errors with proper error messages

### 3. React Component Testing
- Use `undefined` as second parameter in component calls (React children prop)
- Use `waitFor()` for async operations and state updates
- Mock localStorage and sessionStorage for stateful components
- Suspense fallbacks only show when actual suspense occurs

### 5. Action Testing Patterns
- **Fire-and-forget actions** (Pixel, Iframe): Always return `success: true` even on errors to avoid breaking user flow
- **Async operations**: Use `vi.useFakeTimers()` and `vi.advanceTimersByTimeAsync()` for delay and timeout testing
- **DOM manipulation**: Use jsdom for pixel, iframe, and customHtml actions with proper cleanup in `afterEach`
- **Error handling**: Mock console methods (logger.warn) for error path verification without noise
- **HTTP requests**: Mock fetch with different response scenarios (success, network error, timeout)
- **State management**: Test state persistence and retrieval across action executions

## 📊 Coverage Analysis

**Strengths:**
- Core engine routing and validation: 97%+
- Theme management: 100%
- Layout resolution: 100%

**Areas for Improvement (if needed):**
- LandingPage edge cases (popup steps, complex navigation)
- EngineRenderer error boundaries and Suspense handling
- Integration tests across multiple engine components  
**Component Tests:** ⚪ Ready to add  
**Integration Tests:** ⚪ Ready to add  

The engine testing foundation is solid and ready for expansion!
