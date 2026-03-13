import { lazy } from 'react';

import type { ComponentRegistry, RegisteredComponent } from '../contracts';
import { keyFromPath } from './keyFromPath';
import type { ViteImportEntry, ViteImportedModule, ViteModuleMap } from './types';

export interface CreateViteComponentRegistryOptions {
  keyFromModulePath?: (path: string) => string;
  onCollision?: 'throw' | 'replace';
}

function isImportLoader<T>(entry: ViteImportEntry<T>): entry is () => Promise<ViteImportedModule<T>> {
  return typeof entry === 'function';
}

function getDefaultExport<T>(moduleValue: ViteImportedModule<T>): T {
  if (moduleValue && typeof moduleValue === 'object' && 'default' in moduleValue) {
    return moduleValue.default;
  }

  return moduleValue;
}

export function createViteComponentRegistry(
  modules: ViteModuleMap<RegisteredComponent>,
  options: CreateViteComponentRegistryOptions = {}
): ComponentRegistry {
  const registry: ComponentRegistry = {};
  const toKey = options.keyFromModulePath ?? keyFromPath;
  const onCollision = options.onCollision ?? 'throw';

  for (const [path, entry] of Object.entries(modules)) {
    const key = toKey(path);

    if (registry[key] && onCollision === 'throw') {
      throw new Error(`Duplicate component registry key "${key}" generated from ${path}.`);
    }

    registry[key] = isImportLoader(entry)
      ? lazy(async () => ({ default: getDefaultExport(await entry()) }))
      : getDefaultExport(entry);
  }

  return registry;
}
