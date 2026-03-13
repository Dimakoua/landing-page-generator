# @lp-factory/core

Core package for the landing-page engine.

This package is designed to be embedded into a consumer app. The consumer provides:

- a component registry
- project/layout loaders bound to the consumer's own config paths
- optional custom action handlers
- an optional variant resolver

## Status

This is the initial extraction scaffold. The package API is in place for:

- injected component registries
- injected config loaders
- custom action registration
- React context access to the engine instance

The next extraction step is to move the existing runtime renderer and built-in action handlers into this package.

## What This Package Gives You

Right now `@lp-factory/core` gives you the contracts and setup layer for a reusable engine:

- `createEngine()` to create an engine instance
- `EngineProvider` to put that engine into React context
- `useEngine()` to read the engine anywhere in your app
- shared TypeScript types for themes, flows, layouts, and actions
- a place to register extra action handlers

This means the package already solves the integration boundary.
Your app decides:

- where components live
- where landing configs live
- how variants are resolved
- which extra business actions should exist

## Install

```bash
npm install @lp-factory/core react react-dom react-helmet-async
```

`react` and `react-dom` are peer dependencies, so they must exist in the consuming app.

## Vite Convenience Helpers

If your app uses Vite, the package now includes helper functions that convert `import.meta.glob(...)` results into the `components` and `loaders` objects required by `createEngine()`.

These helpers are the recommended answer if you want something simpler than writing the adapter layer manually.

```ts
import {
  createEngine,
  createViteComponentRegistry,
  createViteProjectLoaders,
} from '@lp-factory/core';

const components = createViteComponentRegistry(
  import.meta.glob('./components/**/*.tsx', { eager: true })
);

const loaders = createViteProjectLoaders({
  basePath: './landings',
  themeModules: import.meta.glob('./landings/*/theme*.json'),
  flowModules: import.meta.glob('./landings/*/flow*.json'),
  stepModules: import.meta.glob('./landings/*/steps/*/*.json'),
  namedLayoutModules: import.meta.glob('./landings/*/layouts/*.json'),
});

const engine = createEngine({
  components,
  loaders,
});
```

This is still not a raw `componentsPath` or `configsPath` string API.
But it gives nearly the same developer experience while staying compatible with how Vite actually resolves files.

## Core Idea

You do not point the package at hard-coded folders directly.
Instead, you create an engine and pass it functions that know how to read your folders.

That is the key pattern:

1. register your React components
2. register loaders for your config files
3. optionally register extra actions
4. optionally override variant selection
5. provide the engine to your app through `EngineProvider`

## Minimal Example

```ts
import { createEngine } from '@lp-factory/core';
import { Hero } from './components/Hero';

const engine = createEngine({
  components: {
    Hero,
  },
  loaders: {
    loadProject: async slug => {
      throw new Error(`Not implemented for ${slug}`);
    },
    loadStepLayouts: async () => ({
      desktop: { sections: [] },
      mobile: { sections: [] },
    }),
    loadNamedLayout: async () => ({
      desktop: { sections: [] },
      mobile: { sections: [] },
    }),
  },
});
```

That gives you one engine instance with:

- `engine.components`
- `engine.loaders`
- `engine.resolveVariant()`
- `engine.registerAction()`
- `engine.getActionHandler()`

## Example: Wrap Your App

Use `EngineProvider` once near the top of your app so the engine is available everywhere.

```tsx
import { EngineProvider } from '@lp-factory/core';
import { engine } from './engine';
import { AppRouter } from './AppRouter';

export function App() {
  return (
    <EngineProvider engine={engine}>
      <AppRouter />
    </EngineProvider>
  );
}
```

Then any child component can access it:

```tsx
import { useEngine } from '@lp-factory/core';

export function DebugEngineInfo() {
  const engine = useEngine();

  return (
    <pre>
      {JSON.stringify(
        {
          components: Object.keys(engine.components),
        },
        null,
        2
      )}
    </pre>
  );
}
```

## Example: Register Components

The component registry is just an object whose keys match the names used in your JSON layouts.

If your layout contains:

```json
{
  "sections": [
    {
      "component": "Hero",
      "props": {
        "title": "Launch faster"
      }
    }
  ]
}
```

then your registry must contain `Hero`:

```ts
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { Testimonials } from './components/Testimonials';

export const components = {
  Hero,
  Footer,
  Testimonials,
};
```

The registry keys are the public contract between your JSON and your React code.

## How Folder Configuration Actually Works

The important detail is this:

`@lp-factory/core` does not currently accept a simple option like `componentsPath: './components'` or `configsPath: './landings'`.

Instead, the consuming app is responsible for turning its own folders into:

- a `components` registry
- a `loaders` object

That means the folder configuration lives in your app code, not inside the package.

In practice, that gives you more control because your folders can be:

- local files loaded with `import.meta.glob`
- files from a CMS or API
- files from a monorepo shared package
- files with your own naming convention

So the mental model is:

1. choose any folder structure you want
2. write a small adapter layer in your app
3. pass that adapter layer into `createEngine()`

## Example: Configure a Components Folder

If your components live in a folder like this:

```text
src/
  components/
    Hero.tsx
    Footer.tsx
    Testimonials.tsx
```

you have two common options.

### Option 1: manual registry

This is the simplest and most explicit approach:

```ts
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { Testimonials } from './components/Testimonials';

export const components = {
  Hero,
  Footer,
  Testimonials,
};
```

This is usually the best option if:

- you want strict control over exported component names
- you do not have many components
- you want to avoid accidental auto-registration

### Option 2: auto-register from a folder

If you want the folder itself to drive registration, do it in the consumer app with `import.meta.glob`.

```ts
import type { ComponentRegistry } from '@lp-factory/core';

const modules = import.meta.glob('./components/**/*.tsx', { eager: true });

function componentKeyFromPath(path: string): string {
  const fileName = path.split('/').pop()?.replace(/\.(t|j)sx?$/, '') ?? 'Unknown';
  return fileName;
}

export const components: ComponentRegistry = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const key = componentKeyFromPath(path);
    const componentModule = mod as { default?: React.ComponentType<any> };

    if (!componentModule.default) {
      throw new Error(`Component file ${path} has no default export.`);
    }

    return [key, componentModule.default];
  })
);
```

With that setup:

- `src/components/Hero.tsx` becomes `Hero`
- `src/components/Footer.tsx` becomes `Footer`
- `src/components/Testimonials.tsx` becomes `Testimonials`

Then you pass the result into the engine:

```ts
const engine = createEngine({
  components,
  loaders,
});
```

So the package is not reading your folder directly. Your app reads the folder and builds the registry.

## Example: Configure a Config Folder

The exact same idea applies to JSON configs.

If your landings live here:

```text
src/
  landings/
    sample/
      theme.json
      flow.json
      steps/
        home/
          desktop.json
          mobile.json
```

then your app creates loader functions that know how to read that folder.

```ts
import type { ProjectLoaders } from '@lp-factory/core';

const themeModules = import.meta.glob('./landings/*/theme*.json');
const flowModules = import.meta.glob('./landings/*/flow*.json');
const stepModules = import.meta.glob('./landings/*/steps/*/*.json');

async function readJson<T>(loader?: () => Promise<unknown>): Promise<T> {
  if (!loader) {
    throw new Error('Config file not found.');
  }

  const mod = await loader();
  return (mod as { default: T }).default;
}

export const loaders: ProjectLoaders = {
  async loadProject(slug, variant) {
    const theme = await readJson(
      themeModules[`./landings/${slug}/theme-${variant}.json`] ??
      themeModules[`./landings/${slug}/theme.json`]
    );

    const flow = await readJson(
      flowModules[`./landings/${slug}/flow-${variant}.json`] ??
      flowModules[`./landings/${slug}/flow.json`]
    );

    return {
      theme,
      flows: {
        desktop: flow,
        mobile: flow,
      },
    };
  },

  async loadStepLayouts(slug, stepId, variant) {
    const desktop = await readJson(
      stepModules[`./landings/${slug}/steps/${stepId}/desktop-${variant}.json`] ??
      stepModules[`./landings/${slug}/steps/${stepId}/desktop.json`]
    );

    const mobile = await readJson(
      stepModules[`./landings/${slug}/steps/${stepId}/mobile-${variant}.json`] ??
      stepModules[`./landings/${slug}/steps/${stepId}/mobile.json`] ??
      stepModules[`./landings/${slug}/steps/${stepId}/desktop.json`]
    );

    return { desktop, mobile };
  },

  async loadNamedLayout() {
    throw new Error('Implement named layout loading if your app uses named layouts.');
  },
};
```

Again, the package is not storing the folder path string itself.
Your app owns the folder path and converts it into loader functions.

## Short Answer

If a user asks, "How do I configure the folder with components and configs?", the answer is:

- components folder: turn it into a `components` registry
- configs folder: turn it into `loaders`
- pass both into `createEngine()`

```ts
const engine = createEngine({
  components,
  loaders,
});
```

That is the configuration API right now.

## Example: Load Configs From Your Own Folders

The package does not assume `/src/landings` or `/src/components`.
You control that in your app.

Here is a Vite-based example using `import.meta.glob`.

### Folder shape in the consumer app

```text
src/
  components/
    Hero.tsx
    Footer.tsx
  landings/
    sample/
      theme.json
      flow.json
      steps/
        home/
          desktop.json
          mobile.json
```

### Loader implementation

```ts
import type { LayoutPair, ProjectLoaders, ResolvedProjectConfig } from '@lp-factory/core';

const themeModules = import.meta.glob('./landings/*/theme*.json');
const flowModules = import.meta.glob('./landings/*/flow*.json');
const stepModules = import.meta.glob('./landings/*/steps/*/*.json');
const namedLayoutModules = import.meta.glob('./landings/*/layouts/*.json');

async function readJson<T>(loader?: () => Promise<unknown>): Promise<T> {
  if (!loader) {
    throw new Error('File not found.');
  }

  const mod = await loader();
  return (mod as { default: T }).default;
}

export const loaders: ProjectLoaders = {
  async loadProject(slug, variant): Promise<ResolvedProjectConfig> {
    const themePath = variant
      ? `./landings/${slug}/theme-${variant}.json`
      : `./landings/${slug}/theme.json`;
    const fallbackThemePath = `./landings/${slug}/theme.json`;

    const flowPath = variant
      ? `./landings/${slug}/flow-${variant}.json`
      : `./landings/${slug}/flow.json`;
    const fallbackFlowPath = `./landings/${slug}/flow.json`;

    const theme = await readJson(themeModules[themePath] ?? themeModules[fallbackThemePath]);
    const flow = await readJson(flowModules[flowPath] ?? flowModules[fallbackFlowPath]);

    return {
      theme,
      flows: {
        desktop: flow,
        mobile: flow,
      },
    };
  },

  async loadStepLayouts(slug, stepId, variant): Promise<LayoutPair> {
    const desktopPath = variant
      ? `./landings/${slug}/steps/${stepId}/desktop-${variant}.json`
      : `./landings/${slug}/steps/${stepId}/desktop.json`;
    const mobilePath = variant
      ? `./landings/${slug}/steps/${stepId}/mobile-${variant}.json`
      : `./landings/${slug}/steps/${stepId}/mobile.json`;

    const desktopFallbackPath = `./landings/${slug}/steps/${stepId}/desktop.json`;
    const mobileFallbackPath = `./landings/${slug}/steps/${stepId}/mobile.json`;

    const desktop = await readJson(stepModules[desktopPath] ?? stepModules[desktopFallbackPath]);
    const mobile = await readJson(stepModules[mobilePath] ?? stepModules[mobileFallbackPath] ?? stepModules[desktopFallbackPath]);

    return { desktop, mobile };
  },

  async loadNamedLayout(slug, layoutPath, variant): Promise<LayoutPair> {
    const desktopPath = variant
      ? `./landings/${slug}/${layoutPath}-${variant}-desktop.json`
      : `./landings/${slug}/${layoutPath}-desktop.json`;
    const mobilePath = variant
      ? `./landings/${slug}/${layoutPath}-${variant}-mobile.json`
      : `./landings/${slug}/${layoutPath}-mobile.json`;

    const desktopFallbackPath = `./landings/${slug}/${layoutPath}-desktop.json`;
    const mobileFallbackPath = `./landings/${slug}/${layoutPath}-mobile.json`;

    const desktop = await readJson(namedLayoutModules[desktopPath] ?? namedLayoutModules[desktopFallbackPath]);
    const mobile = await readJson(namedLayoutModules[mobilePath] ?? namedLayoutModules[mobileFallbackPath] ?? namedLayoutModules[desktopFallbackPath]);

    return { desktop, mobile };
  },
};
```

This is the pattern to follow if you want users to configure paths to their own config files.
The paths are not stored inside `@lp-factory/core`; they live in the consuming app.

## Example: Register Extra Actions

If your product needs custom behavior, register extra actions when creating the engine.

```ts
import { createEngine, type EngineActionHandler } from '@lp-factory/core';

const syncCrm: EngineActionHandler = async (action, context) => {
  const pluginAction = action.type === 'plugin' ? action : null;

  if (!pluginAction || pluginAction.name !== 'crm-sync') {
    return {
      success: false,
      error: new Error('Unsupported plugin action.'),
    };
  }

  const lead = context.getState('lead');

  await fetch('/api/crm/sync', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ lead }),
  });

  return { success: true };
};

const engine = createEngine({
  components,
  loaders,
  actions: {
    'plugin:crm-sync': syncCrm,
  },
});
```

And your JSON can reference it like this:

```json
{
  "type": "plugin",
  "name": "crm-sync"
}
```

The convention is:

- JSON action: `type: "plugin"`, `name: "crm-sync"`
- handler registration key: `plugin:crm-sync`

## Example: Custom Variant Resolution

By default, the engine resolves a variant from:

1. `?variant=...` in the URL
2. storage key `ab_variant_<slug>`
3. fallback to `A`

You can override that completely:

```ts
const engine = createEngine({
  components,
  loaders,
  variantResolver: ({ slug, url, storage }) => {
    const fromUrl = url?.searchParams.get('variant');
    if (fromUrl) {
      return fromUrl;
    }

    const fromCookieBackedStorage = storage?.getItem(`variant:${slug}`);
    if (fromCookieBackedStorage) {
      return fromCookieBackedStorage;
    }

    return 'B';
  },
});
```

This is useful when:

- your A/B test source is not session storage
- you want server-defined variants
- you want deterministic variants by campaign or user segment

## Example: Build a Shared Engine Module

In most apps, you will create one shared file that wires everything together.

```ts
import { createEngine } from '@lp-factory/core';

import { components } from './components';
import { loaders } from './loaders';
import { crmSyncAction } from './actions/crmSyncAction';

export const engine = createEngine({
  components,
  loaders,
  actions: {
    'plugin:crm-sync': crmSyncAction,
  },
});
```

That keeps your integration point clean and makes the rest of the app depend on one engine object.

## Exported Types

The package exports the main contracts you need to type your integration code:

- `EngineOptions`
- `EngineRuntime`
- `ComponentRegistry`
- `ProjectLoaders`
- `ResolvedProjectConfig`
- `LayoutPair`
- `VariantResolver`
- `EngineActionHandler`
- `Theme`
- `Flow`
- `Layout`
- `Action`
- `ActionContext`

## Current Limitation

This package is currently the integration layer and contract layer.
It does not yet include the full renderer/runtime extracted from the main app.

That means:

- you can already standardize how engines are created
- you can already standardize loaders, components, and custom actions
- the actual existing landing renderer still needs to be moved into this package in the next extraction step

## Recommended App Structure

One reasonable consumer structure looks like this:

```text
src/
  engine/
    index.ts
    loaders.ts
    components.ts
    actions/
      crmSyncAction.ts
  components/
    Hero.tsx
    Footer.tsx
  landings/
    sample/
      theme.json
      flow.json
      steps/
        home/
          desktop.json
          mobile.json
```

This keeps the responsibilities separate:

- `components/` contains UI
- `landings/` contains JSON content and layout config
- `engine/` contains the glue code that binds your app to `@lp-factory/core`

## Summary

Use `@lp-factory/core` when you want a reusable engine contract but still want full control over:

- where components live
- where configs live
- how variants are resolved
- which custom business actions exist

If you want, the next step can be adding a second README section with a full end-to-end sample project structure and a complete `loaders.ts` file that matches this repo's current landing format exactly.
