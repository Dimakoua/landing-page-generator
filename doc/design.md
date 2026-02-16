# design.md

Version: 1.2

Last updated: 2026-02-13

Status: Active

Authority: Technical decisions source of truth; aligns with scope.md

## Purpose

This document defines the technical architecture, design patterns, and implementation guidelines for the Landing Page Engine. It serves as the reference for all code decisions to ensure that the system remains a decoupled, high-performance rendering shell that can scale to 3-5 new landing pages per week.

## 1. Architecture Overview

### 1.1 System Context

- **Primary Purpose:** A frontend-only orchestration layer that consumes standardized JSON folders to build complex, multi-step marketing funnels.
- **Users:** Marketing Ops (authors) and Frontend Engineers (component developers).
- **Integrates with:** Static Asset Hosts (S3/CDN) for JSON fetching and external REST APIs for lead capture.
- **Boundaries:** Does not handle backend persistence, CMS visual editing, or server-side business logic.

### 1.2 High-Level Architecture

The system follows a Registry Pattern combined with a Finite State Machine for navigation. It utilizes a Project Resolver to map URL slugs to specific landing folders.

**Architecture style:** Layered Orchestration (Client-Side)

**Diagram:**

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (CLIENT)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  PROJECT RESOLVER                 │  │
│  │       (Detects Slug -> Fetches JSON Folder)       │  │
│  └──────────┬───────────────────────────────┬────────┘  │
│             ▼                               ▼           │
│  ┌───────────────────┐           ┌───────────────────┐  │
│  │   FLOW ENGINE     │           │   THEME INJECTOR  │  │
│  │ (State Machine)   │           │  (CSS Variables)  │  │
│  └──────────┬────────┘           └──────────┬────────┘  │
│             ▼                               ▼           │
│  ┌───────────────────────────────────────────────────┐  │
│  │                LAYOUT RENDERER (Vite)             │  │
│  │       (Device Detection -> Registry Lookup)       │  │
│  └──────────────────────────┬────────────────────────┘  │
│                             ▼                           │
│                 ┌───────────────────────────┐           │
│                 │    COMPONENT REGISTRY     │           │
│                 │ (Lazy-loaded UI Sections) │           │
│                 └───────────────────────────┘           │
### 1.4 Hybrid Event-Action Architecture

**Architecture style:** Event-Driven Orchestration with Imperative Actions

**Core Pattern:** Actions for user interactions and business logic, Events for state propagation and side effects.

**Diagram:**

```
┌─────────────────────────────────────────────────────────┐
│                 HYBRID EVENT-ACTION SYSTEM              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              USER INTERACTION                      │  │
│  │     (Button Click, Form Submit, etc.)             │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        ▼                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │            ACTION DISPATCHER                      │  │
│  │   (Imperative: Validate, Execute, Handle Errors)  │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        ▼                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │            EVENT BUS (Reactive)                   │  │
│  │   (STATE_UPDATED, NAVIGATE, API_SUCCESS, etc.)    │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        ▼                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │            STATE MANAGEMENT                       │  │
│  │   (useEngineState + sessionStorage + per-tab)  │  │
│  └─────────────────────┬─────────────────────────────┘  │
│                        ▼                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │            COMPONENT RE-RENDER                     │  │
│  │   (Reactive UI Updates)                            │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Component responsibilities:**

- **Action Dispatcher:** Handles imperative user actions (navigate, API calls, state changes) with validation and error handling.
- **Event Bus:** Enables reactive communication between components and side effects.
- **State Management:** Combines direct updates with event-driven sync for cross-component consistency.
- **Components:** Can emit events directly for simple reactive updates, use dispatcher for complex business logic.

**Benefits:**
- **Decoupling:** Components communicate via events without direct dependencies.
- **Reactivity:** State changes propagate automatically across the application.
- **Extensibility:** Easy to add analytics, logging, or plugin listeners.
- **Performance:** Event-driven updates prevent unnecessary re-renders.

### 1.3 Technology Stack

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| Runtime | React | 18.x | Standard for component-based UI. |
| Language | TypeScript | 5.x | Enforces strict schema typing. |
| Build Tool | Vite | 5.x | High-speed HMR and optimized splitting. |
| Styling | Tailwind CSS | 3.x | Utility-first, plays well with CSS variables. |
| Validation | Zod | 3.x | Runtime validation of untrusted JSON config. |
| State | React useState + sessionStorage + EventBus | 18.x | Component-level state with per-tab browser persistence and reactive updates. |
| Events | Custom EventBus | N/A | Pub/sub system for reactive communication and side effects. |

## 2. Design Principles

### 2.1 Core Principles

1. **Configuration over Code**
   - **Meaning:** Layout and actions live in JSON; React components are "dumb" skins.
   - **Application:** A marketing operator can change a funnel's order or layout without a code deployment.
   - **Example:** Components define navigation actions in layout JSON that trigger the ActionDispatcher.

2. **Device Isolation**
   - **Meaning:** Mobile and Desktop layouts are separate files, not just media queries.
   - **Application:** Prevents mobile users from downloading or rendering heavy desktop-only DOM elements.
   - **Example:** mobile.json might omit a heavy Video Hero present in desktop.json.

3. **Event-Driven Communication**
   - **Meaning:** Components communicate via events rather than direct method calls.
   - **Application:** Enables reactive updates, cross-component synchronization, and plugin extensibility.
   - **Example:** State changes emit STATE_UPDATED events that other components can listen to.

### 2.2 Error Handling Strategy

**Error types:**

- **Critical (Schema Mismatch):** JSON fails Zod validation. → Strategy: Fail fast; show a "Maintenance" fallback.
- **Operational (Component Missing):** Registry can't find a component type. → Strategy: Render a FallbackSection with a console warning in dev, hidden in prod.

## 3. Module Design

### 3.1 Directory Structure

```
src/
├── engine/              # Core Logic
│   ├── events/          # Event-Driven Architecture
│   │   ├── EventBus.ts
│   │   └── types.ts
│   ├── actions/         # Action Handlers
│   ├── hooks/           # React Hooks
│   ├── ProjectResolver.tsx
│   ├── FlowProvider.tsx
│   ├── ThemeInjector.tsx
│   └── ActionDispatcher.ts
├── registry/            # Component Mapping
│   └── ComponentMap.ts  # SSOT for UI strings
├── components/          # UI Primitives
│   ├── sections/        # Hero, Pricing, Testimonials
│   └── forms/           # Inputs, Selectors
├── landings/            # Config Storage (One folder per LP)
│   ├── _template/       # Base boilerplate for cloning
│   └── alpha-promo/
│       ├── theme.json
│       ├── flow.json
│       └── steps/
│           └── home/
│               ├── desktop.json
│               └── mobile.json
└── schemas/             # Zod Validation Definitions
    ├── actions.ts
    ├── events.ts
    └── ...
```

### 3.2 Layer Responsibilities

**Engine Layer (Orchestrator):**

- **Purpose:** The bridge between raw data and React execution with reactive communication.
- **Responsibilities:**
  - ✅ Resolve URL slugs to folder paths.
  - ✅ Validate JSON integrity via Zod.
  - ✅ Inject CSS variables into :root.
  - ✅ Manage event-driven state synchronization.
  - ✅ Route actions to handlers and emit reactive events.
  - ❌ Do not contain business logic for specific marketing campaigns.

**Registry Layer:**

- **Purpose:** Static lookup table.
- **Responsibilities:**
  - ✅ Map string names to React.Component types.
  - ✅ Handle React.lazy logic for bundle optimization.

## 4. Security Guidelines

### 4.1 Input Validation

- **Validation library:** Zod
- **Where:** Data fetching boundary (immediately after loading JSON).
- **Validate:**
  - ✅ Flow and layout files conform to schemas (FlowSchema, LayoutSchema, ThemeSchema).
  - ✅ Component props must match the expected TypeScript interface for that component.
  - ✅ Actions conform to ActionSchema with proper type discrimination.

## 5. Performance Guidelines

### 5.1 Caching Strategy

**What to cache:**

- ✅ JSON Configs: Cached at CDN edge with short TTL (5 min) for rapid updates.
- ✅ UI Components: Long-term browser cache via hashed Vite assets.

## 6. Decision Log (ADRs)

### 6.1 ADR-001: Multi-File JSON Structure

**Date:** 2026-02-09

**Status:** Accepted

**Context:** Gigantic JSON files are hard to read and merge.

**Decision:** Break configurations into theme, flow, and a folder for steps.

**Consequences:** ✅ Easier debugging. ✅ Marketing can edit specific steps without touching the theme.

### 6.3 ADR-003: Hybrid Event-Action Architecture

**Date:** 2026-02-13

**Status:** Accepted

**Context:** Need reactive state synchronization and side effects while maintaining imperative action handling for complex business logic.

**Decision:** Implement hybrid system where Actions handle user interactions and business logic, Events enable reactive state propagation and side effects.


## 7. Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-09 | 1.0 | Initial design for high-velocity engine | Gemini |
| 2026-02-13 | 1.1 | Added hybrid event-action architecture, EventBus integration, and reactive state management | GitHub Copilot |
| 2026-02-13 | 1.2 | Added NavigateAction and CartAction handler refactoring for better separation of concerns | GitHub Copilot |