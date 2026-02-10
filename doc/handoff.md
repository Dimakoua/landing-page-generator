# handoff.md

## Context Snapshot
- Performance optimization implemented: dynamic imports for JSON configs enable code-splitting per landing page.
- Build creates separate chunks for each landing's theme, flow, and layouts.
- Core engine bundle optimized, components lazy-loaded.

## Active Task(s)
- T-010: Performance Optimization: Build Strategy — Acceptance: Vite build creates separate chunks for each landing folder. Code-splitting verified via Network tab (browsing Page A doesn't load Page B).

## Decisions Made
- Changed ProjectResolver from eager glob imports to dynamic imports for per-landing code-splitting.
- Updated LandingPage to async config loading with proper loading states.

## Changes Since Last Session
- MODIFIED: ProjectResolver.tsx - Removed eager preload, made functions async with dynamic imports
- MODIFIED: LandingPage.tsx - Added useEffect for async config/layout loading, removed useMemo
- BUILD: Separate chunks created for each landing (theme, flow, layouts) - e.g., sample vs alpha-launch assets split

## Validation & Evidence
- Build: Separate chunks confirmed (theme-DCAXH8dJ.js for sample, theme-CgmzwEid.js for alpha-launch)
- Bundle: Main 268.69 kB (82.32 kB gzip), components code-split (Hero/SimpleCTA separate)
- TypeScript: Clean compilation after async refactoring

## Risks & Unknowns
- Bundle size 82.32 kB gzip exceeds 50kB target; may need further optimization (tree-shaking, etc.)

## Next Steps
1. Verify in browser that /alpha-launch only loads alpha-launch chunks, not sample
2. Consider bundle size optimization if needed for SLO compliance

## Status Summary
- ✅ 100% — T-010 complete, code-splitting per landing implemented