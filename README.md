# Landing Page Factory - Architecture

## Project Structure

```
src/
├── engine/              # Core orchestration logic
│   ├── ProjectResolver.tsx   # Loads JSON configs by slug
│   ├── ThemeInjector.tsx     # Injects CSS variables
│   ├── useFunnel.ts          # Zustand-based step navigation
│   ├── LayoutResolver.tsx    # Device detection & layout selection
│   └── EngineRenderer.tsx    # Renders components from JSON
├── schemas/             # Zod validation schemas
│   └── index.ts              # Theme, Flow, Layout schemas
├── registry/            # Component mapping
│   └── ComponentMap.ts       # Maps strings to lazy-loaded components
├── components/          # UI primitives
│   ├── sections/             # Hero, CTA, etc.
│   └── forms/                # Form inputs (future)
└── landings/            # JSON-driven landing pages
    ├── _template/            # Boilerplate for new landings
    │   ├── theme.json
    │   ├── flow.json
    │   └── steps/
    │       └── home/
    │           ├── desktop.json
    │           └── mobile.json
    └── [slug]/               # Each landing is a folder
        ├── theme.json        # Colors, fonts, spacing
        ├── flow.json         # Step navigation logic
        └── steps/
            └── [stepId]/     # One folder per step
                ├── desktop.json
                └── mobile.json
```

## Design Principles

1. **Configuration over Code**: Marketers change JSON, not React components
2. **Strict Folder Encapsulation**: Each landing is self-contained
3. **Device Isolation**: Mobile doesn't load desktop code
4. **Lazy Loading**: Components load on-demand

## Quick Start

```bash
npm install
npm run dev
```

## Creating a New Landing

1. Clone the template: `cp -r src/landings/_template src/landings/my-promo`
2. Update `theme.json` with brand colors
3. Define steps in `flow.json`
4. Create step layouts in `steps/[stepId]/`

See full documentation in `/doc/design.md`
