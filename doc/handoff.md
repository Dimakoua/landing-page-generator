# handoff.md
## Context Snapshot
- Completed comprehensive review of all UI components for business logic separation
- Applied refactoring pattern from Navigation and Hero components to remaining components
- Verified all components follow proper separation of concerns
- Fixed failing ActionDispatcher unit tests by implementing centralized validation and defaults
- Integrated dual HeatmapRecorders into sample landing page (desktop-A.json) for user interaction tracking using both custom and Google Analytics providers.
- Expanded error tracking infrastructure by adding multiple provider options: Composite, Noop, and Sentry (stub).
- Verified error tracking providers with new unit tests.
- Implemented `Wrapper` component and component lifecycle hooks (`beforeMount`, `onMount`, `beforeUnmount`, `onUnmount`).
- Added array-shorthand action support with automatic normalization to `chain` actions.
- Updated layout schema and TypeScript interfaces to support new lifecycle and array features.
## Active Task(s)
- ✅ Component Architecture Review — Completed.
- ✅ ActionDispatcher Test Stabilization — Completed.
- ✅ HeatmapRecorder Lint & Purity Fix — Completed.
- ✅ Heatmap Configuration — Dual custom and GA trackers implemented.
- ✅ Expanded Error Tracking Providers — Added Composite, Noop, and Sentry support.
- ✅ Documentation Cleanup & Restructuring (T-031) — 100% completed.
- ✅ Wrapper Component & Lifecycle Actions (T-033) — 100% completed.
- ✅ Array-Shorthand Action Support (T-034) — 100% completed.
## Decisions Made
- Implemented `ActionDispatcher.prepareAction` to centrally handle action validation and defaults enrichment.
- Standardized error message prefixes ("Action validation failed") to align with test expectations.
- Ensured all core actions (redirect, api, analytics, pixel, iframe, customHtml, setState, log) receive appropriate default values before being dispatched to handlers.
- Refactored `HeatmapRecorder` to use `useCallback` and `useState` lazy patterns to satisfy strict `react-hooks/purity` and `exhaustive-deps` rules.
- Configured HeatmapRecorder to use `custom` provider with `/api/analytics/heatmap` endpoint in `desktop-A.json`.
- Implemented flexible Google Analytics multi-tagging support in the engine and schemas.
- Consolidate project documentation: pruned 15+ legacy components from `docs/COMPONENTS.md`, removed unsupported theme features (`extends`, `shadows`), and established a new `docs/README.md` index.
- Merged `ANALYTICS.md` into `FLOWS.md` and `ACTION_DISPATCHER.md` to reduce duplication.
- Updated all documentation files to strictly use real components from `src/components/`.
- Introduced `Wrapper` component for nested layouts and `SectionWithLifecycle` for declarative lifecycle hooks.
- Implemented a normalization utility `normalizeActionOrArray` to support concise action arrays in JSON.
## Changes Since Last Session
- src/components/wrapper/Wrapper.tsx (New): Generic container for nested sections.
- src/engine/hooks/useComponentLifecycle.ts (New): Hook for executing declarative lifecycle actions.
- src/engine/utils/SectionWithLifecycle.tsx (New): Internal wrapper component for applying lifecycle hooks.
- src/engine/utils/actionUtils.ts (New): Normalization utility for ActionOrArray support.
- src/engine/ActionDispatcher.ts (+25/-5): Added AbortController tracking and component-level aborting.
- src/engine/utils/renderSection.tsx (+20/-5): Integrated lifecycle wrapping and action normalization.
- src/schemas/index.ts (+10/-5): Added `lifetime` to `LayoutSection` and updated action types.
- src/schemas/actions.ts (+15/-0): Defined `LifetimeActions` and `ActionOrArray`.
- schemas/layout.schema.json (+40/-10): Updated schema for `lifetime` and `actionOrArray` support.
## Validation & Evidence
- ActionDispatcher: 32/32 passing (vitest)
- useComponentLifecycle: 5/5 passing (vitest)
- Wrapper: 4/4 passing (vitest)
- renderSection normalization: 1/1 passing (vitest)
- build succeeds without errors
- Documentation: Updated [COMPONENTS.md](docs/COMPONENTS.md) and [ACTION_DISPATCHER.md](docs/ACTION_DISPATCHER.md). New [LIFECYCLE.md](docs/LIFECYCLE.md).
- All other tests (actions, components, utils) remain passing.

### 6.4 ADR-004: Navigate Action Handler Refactoring

**Date:** 2026-02-13

**Status:** Accepted

**Context:** Navigation component contained complex URL routing logic (anchor links, external URLs, internal paths) that should be centralized in the action handler layer for better separation of concerns and reusability.

**Decision:** Move URL parsing and routing logic from Navigation component to the NavigateAction handler. The handler now supports:
- Anchor links (#fragment) - smooth scroll to element
- External URLs (http/https) - open in new tab with security attributes
- Internal paths - delegate to context navigation

**Consequences:** 
- ✅ Cleaner component code - Navigation component now just dispatches actions
- ✅ Centralized routing logic - all navigation behavior in one place
- ✅ Better testability - action handler can be unit tested independently
- ✅ Reusability - any component can use navigate actions with consistent behavior
- ✅ Maintainability - URL handling logic changes don't require component updates

### 6.5 ADR-005: Cart Action Handler Refactoring

**Date:** 2026-02-13

**Status:** Accepted

**Context:** Hero component contained complex logic for modifying cart actions to include selected quantity and color before dispatching. This business logic should be centralized in the CartAction handler for better separation of concerns and reusability.

**Decision:** Move cart item modification logic from Hero component to CartAction handler. Extended CartActionSchema to support `quantity` and `color` parameters that override item properties dynamically.

**Consequences:** 
- ✅ Cleaner component code - Hero component now just dispatches actions with parameters
- ✅ Centralized cart logic - all cart modifications happen in one place
- ✅ Better extensibility - any component can modify cart items by passing parameters
- ✅ Consistent behavior - cart operations work the same regardless of source component
- ✅ Easier testing - cart logic can be tested independently of UI components
## Validation & Evidence
- All components reviewed and confirmed to follow separation of concerns
- 26/26 tests passing across refactored components
- Build succeeds without errors
## Status Summary
- ✅ 100% — Component architecture review complete, all components properly structured