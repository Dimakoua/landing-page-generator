# scope.md

Version: 1.0

Last updated: 2026-02-09

Status: Active — defines project boundaries and success criteria

## Purpose

This document defines the architecture and delivery of a JSON-driven landing page engine. It exists to ensure the technical implementation remains a decoupled, high-performance "rendering shell" that consumes standardized content schemas.

## Vision

Build a high-performance React orchestration layer that treats marketing funnels as data rather than hardcoded routes.

**Problem:** Manual landing page development creates bottlenecks where simple copy/layout changes require developer intervention and PR cycles.

**Approach:** A unified React engine that resolves a state machine (flow.json), injects global styles (theme.json), and renders device-specific layouts (desktop.json / mobile.json) via a standardized component registry.

## Goals (what success looks like)

- Zero-Code Content Updates: Marketing or Ops can change a page layout or funnel order by modifying JSON files without touching .tsx files.
- Device Autonomy: Mobile and Desktop versions of the same step can have entirely different component compositions to optimize for conversion.
- Deterministic Routing: The "Next" step in a funnel is controlled by logic defined in the schema, not hardcoded Link components.
- Thematic Consistency: Global tokens (colors, fonts, radius) are applied instantly via CSS variables injected at the root.
- Rapid Prototyping: A new multi-step funnel can be "authored" in under 30 minutes once the core components exist in the registry.

## Success Metrics (SLOs)

- Lighthouse Performance Score: ≥ 90 (p90) on mobile devices for the rendered engine.
- Configuration Hot-Swap: Time to update a live funnel (JSON change to deployment) ≤ 5 minutes.
- Component Reusability: ≥ 80% of sections across different funnels utilize the existing Component Registry.
- Bundle Size: Core Engine runtime (excluding component library) ≤ 50kB Gzip.

## In Scope

- Core Engine: The React logic that parses JSON and maps strings to components.
- Funnel State Machine: Logic to handle next, onApprove, and onDecline actions.
- Responsive Layout Switcher: Automatic detection and rendering of mobile.json vs desktop.json.
- Global Theme Injector: System to transform theme.json into runtime CSS variables.
- Standard Component Registry: A base set of UI primitives (Hero, Form, BundleSelector, SuccessMessage).
- External Data Fetching: Support for API_POST actions within the JSON schema for form submissions.

## Out of Scope (for now)

- Visual Page Builder: A GUI for dragging and dropping components (JSON must be edited manually or via IDE).
- Backend API Implementation: The engine handles the request logic; the actual API endpoints are outside this project.
- A/B Testing Dashboard: Integration with tools like Optimizely is allowed, but a native dashboard is not included.
- Server-Side Rendering (SSR): This version focuses on a high-performance Client-Side (SPA) or Static-Site (SSG) approach.

## Constraints & Assumptions

- React-Based: The engine must be built using React 18+ and TypeScript.
- Tailwind/CSS Vars: Styles must be driven by CSS variables to allow the theme.json to function.
- JSON Structure: All configuration files must follow the schema defined in the technical specification.
- Assumption: Users have a basic understanding of JSON syntax for authoring steps.
- Assumption: All UI components in the registry are accessible and responsive by default.

## Stakeholders

| Stakeholder | Role | Responsibility |
|-------------|------|----------------|
| Frontend Architect | Owner | Maintains the Engine and Registry integrity |
| Marketing Ops | Actor | Authors the JSON files for new campaigns |
| Creative/Design | Advisor | Ensures components meet brand guidelines |
| Performance Lead | Advisor | Monitors Lighthouse and Core Web Vitals |

## Risks (initial)

- JSON Complexity → Mitigation: Implement a JSON Schema (JSONSchema.org) for validation during the build step.
- Component Bloat → Mitigation: Use React.lazy in the Component Registry to ensure users only download components used in their specific funnel.
- Broken Funnel Logic → Mitigation: Build a "Dry Run" validator that checks flow.json for circular references or dead ends.

## Milestones

- M1: Core Engine & Theme Injector (JSON to CSS Variables) — Target: Week 1
- M2: Funnel Navigation Logic (Flow State Machine) — Target: Week 2
- M3: Responsive Layout Switcher (Mobile vs Desktop) — Target: Week 2
- M4: Component Registry v1 (Hero, Form, List) — Target: Week 3
- M5: Pilot Funnel (Landing → Checkout → Success) — Target: Week 4

## Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-09 | 1.0 | Initial scope defined | Gemini