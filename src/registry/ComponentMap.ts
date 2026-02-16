import { lazy } from 'react';

// AUTO-GENERATED REGISTRY (runtime):
// Use Vite's import.meta.glob to discover components under `src/components` and
// expose them as a map keyed by PascalCased filename (e.g. `Hero`, `Cart`).
// Benefits:
// - No manual edits to keep registry in sync as components are added/removed
// - Preserves lazy-loading behavior for bundle splitting
// - Allows explicit overrides if a component needs a custom key

const ComponentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {};

// Glob pattern matches component files named like `Xxx.tsx` or `index.tsx` inside a folder
// Exclude Storybook stories and test files so they are not bundled into the app build.
// Using an extglob negation prevents `*.stories.*` and `*.test.*` files from being matched.
const modules = import.meta.glob('../components/**/!(*.stories|*.test).{tsx,ts,jsx,js}');

import { keyFromPath } from './keyFromPath';


for (const path in modules) {
  try {
    const key = keyFromPath(path);
    // Wrap dynamic import in React.lazy so consumers get the same lazy behavior
    // Note: modules[path] is a function that returns a Promise resolving to the module
    // We need to create a function that calls the dynamic import and returns the default export
    // React.lazy accepts a factory that returns a promise to a module with default export
    // However some modules may export named exports — keep the default export assumption (current codebase uses default)
    ComponentMap[key] = lazy(async () => {
      const mod = await (modules as Record<string, () => Promise<any>>)[path]();
      // Prefer default export, otherwise try named export matching the key
      return { default: mod.default || mod[key] || Object.values(mod)[0] };
    });
  } catch (err) {
    // Ignore failures during module discovery — fallback to manual entries if needed
    console.warn('[ComponentMap] failed to register', path, err);
  }
}

// Explicit manual overrides (kept for backwards compatibility / special cases)
// Add entries here if a component should have a different registry key than the file name.
// Example: ComponentMap['MyLegacyName'] = lazy(() => import('../components/special/RealName'));

export default ComponentMap;