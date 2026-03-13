import type { ComponentType } from 'react';

import {
  createEngine,
  createViteComponentRegistry,
  createViteProjectLoaders,
  type Layout,
  type Theme,
  type Flow,
  type ViteModuleMap,
} from '@lp-factory/core';

const components = createViteComponentRegistry(
  import.meta.glob('./components/**/*.tsx', { eager: true }) as ViteModuleMap<ComponentType<any>>
);

const loaders = createViteProjectLoaders({
  basePath: './landings',
  themeModules: import.meta.glob('./landings/*/theme*.json') as ViteModuleMap<Theme>,
  flowModules: import.meta.glob('./landings/*/flow*.json') as ViteModuleMap<Flow>,
  stepModules: import.meta.glob('./landings/*/steps/*/*.json') as ViteModuleMap<Layout>,
  namedLayoutModules: import.meta.glob('./landings/*/layouts/*.json') as ViteModuleMap<Layout>,
});

export const engine = createEngine({
  components,
  loaders,
});
