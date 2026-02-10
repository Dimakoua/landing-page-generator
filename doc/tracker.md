# tracker.md

Version: 1.0

Last updated: 2026-02-10

Status: Active task tracking — single source of truth for work items

## Purpose

This document tracks the implementation of the JSON-Driven Landing Page Engine. It ensures that both the core orchestration logic and the high-velocity landing page folders are built according to the design.md specifications.

## Status Glyphs

- ⚪ Not started — Task defined but not yet begun
- 🔵 In progress — Actively being worked on
- ✅ Done — Completed and meets acceptance criteria
- ⚠️ Blocked — Cannot proceed, needs intervention

## Active Tasks

### T-001 — Project Scaffolding & Infrastructure

**Owner:** AI Assistant / Dev

**Status:** ✅ 100% | Dates: started 2026-02-09, completed 2026-02-10

**Scope:** scope.md § In Scope (Core Engine)

**Design:** design.md §3.1 (Directory Structure)

**Acceptance criteria:**

- Vite + React + TS + Tailwind initialized.
- Dependencies installed: zod, zustand, react-responsive.
- Directory structure created: /src/engine, /src/registry, /src/components, /src/landings.

**Evidence:** npm run build succeeds (193.91 kB bundle), directories exist in /src, packages installed (zod@4.3.6, zustand@5.0.11, react-responsive@10.0.1, tailwindcss@4.1.18).

**Dependencies:** None

## Backlog (Not Started)

### T-002 — Zod Schema Definitions

**Owner:** AI Assistant

**Status:** ✅ 100% | Dates: started 2026-02-10, completed 2026-02-10

**Scope:** scope.md § In Scope (Core Engine)

**Design:** design.md §4.1 (Input Validation)

**Acceptance criteria:**

- ThemeSchema defined for brand tokens.
- FlowSchema defined for step transitions and routes.
- LayoutSchema defined for section props and types.
- Exported TypeScript types inferred from Zod.

**Evidence:** schemas.ts created in /src/engine/, TypeScript compilation succeeds (tsc --noEmit), types exported (Theme, Flow, Layout).

### T-003 — Project Resolver (Folder-Based Loader)

**Owner:** AI Assistant

**Status:** ⚪ 0% | Dates: planned start 2026-02-09

**Scope:** scope.md § In Scope (Core Engine)

**Design:** design.md §1.2 (Multi-Landing Structure)

**Acceptance criteria:**

- Implementation of getProjectConfig(slug) function.
- Successfully fetches theme.json and flow.json from src/landings/[slug]/.
- Handles 404/Missing project scenarios gracefully.

### T-004 — Theme Injector & CSS Variable System

**Owner:** AI Assistant

**Status:** ⚪ 0% | Dates: planned start 2026-02-09

**Scope:** scope.md § Goals (Thematic Consistency)

**Design:** design.md §3.2 (Engine Layer)

**Acceptance criteria:**

- ThemeInjector component maps tokens.colors to --color-* variables.
- tokens.fonts applied to document root.
- Visual check: Changing primary color in JSON updates UI without refresh.

### T-005 — Funnel State Machine (useFunnel)

**Owner:** AI Assistant

**Status:** ⚪ 0% | Dates: planned start 2026-02-10

**Scope:** scope.md § In Scope (Funnel State Machine)

**Design:** design.md §1.2 (Flow Controller)

**Acceptance criteria:**

- Zustand store tracks currentStepId and formData.
- MapsNext() logic correctly reads next from flow.json.
- Support for popup step types (rendering as overlay instead of route).

### T-006 — Device Layout Switcher

**Owner:** AI Assistant

**Status:** ⚪ 0% | Dates: planned start 2026-02-10

**Scope:** scope.md § Goals (Device Autonomy)

**Design:** design.md §2.1 (Core Principles)

**Acceptance criteria:**

- LayoutResolver uses react-responsive to detect viewport.
- Loads desktop.json for width > 768px, otherwise mobile.json.
- Hot-swaps layout instantly when resizing browser.

### T-007 — Component Registry & Renderer

**Owner:** AI Assistant

**Status:** ⚪ 0% | Dates: planned start 2026-02-11

**Scope:** scope.md § In Scope (Component Registry)

**Design:** design.md §3.2 (Registry Layer)

**Acceptance criteria:**

- Registry maps string keys to lazy-loaded React components.
- EngineRenderer maps layout arrays to component instances.
- Fallback UI renders if a component type is not found in Registry.

### T-008 — Core Components: HERO_V1 & SIMPLE_CTA

**Owner:** AI Assistant

**Status:** ⚪ 0% | Dates: planned start 2026-02-11

**Acceptance criteria:**

- HeroV1 supports title, subtitle, and background image from JSON.
- SimpleCTA triggers the MapsNext funnel action.
- Both components use CSS variables for all styling.

### T-009 — Pilot Landing Page: "Alpha Launch"

**Owner:** AI Assistant

**Status:** ⚪ 0% | Dates: planned start 2026-02-12

**Scope:** scope.md § Milestones (M5)

**Acceptance criteria:**

- Folder landings/alpha-launch/ created.
- Complete flow: landing-main (Hero) -> order (CTA) -> success.
- Verified working on both Desktop and Mobile viewports.

### T-010 — Performance Optimization: Build Strategy

**Owner:** AI Assistant

**Status:** ⚪ 0% | Dates: planned start 2026-02-12

**Scope:** scope.md § Success Metrics (Lighthouse)

**Acceptance criteria:**

- Vite build creates separate chunks for each landing folder.
- Code-splitting verified via Network tab (browsing Page A doesn't load Page B).

## Completed Tasks

None yet. Implementation begins with T-001.

## Task Numbering

- Current highest number: T-010
- Next task: T-011

## Changelog

| Date | Changes | Author |
|------|---------|--------|
| 2026-02-09 | Initial tracker created with 10 core tasks | Gemini