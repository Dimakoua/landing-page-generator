import type { Flow, Layout, Theme } from '../schemas';
import type { LayoutPair, ProjectLoaders, ResolvedProjectConfig } from '../contracts';
import type { ViteImportEntry, ViteImportedModule, ViteModuleMap } from './types';

export interface CreateViteProjectLoadersOptions {
  basePath?: string;
  themeModules: ViteModuleMap<Theme>;
  flowModules?: ViteModuleMap<Flow>;
  flowDesktopModules?: ViteModuleMap<Flow>;
  flowMobileModules?: ViteModuleMap<Flow>;
  stepModules: ViteModuleMap<Layout>;
  namedLayoutModules?: ViteModuleMap<Layout>;
}

function isImportLoader<T>(entry: ViteImportEntry<T>): entry is () => Promise<ViteImportedModule<T>> {
  return typeof entry === 'function';
}

async function resolveModule<T>(entry?: ViteImportEntry<T>): Promise<T> {
  if (!entry) {
    throw new Error('Requested Vite module was not found.');
  }

  const resolved = isImportLoader(entry) ? await entry() : entry;

  if (resolved && typeof resolved === 'object' && 'default' in resolved) {
    return resolved.default;
  }

  return resolved;
}

function normalizeBasePath(basePath: string | undefined): string {
  const value = basePath?.trim() || './landings';
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function pickFirst<T>(...entries: Array<ViteImportEntry<T> | undefined>): ViteImportEntry<T> | undefined {
  return entries.find(Boolean);
}

export function createViteProjectLoaders(options: CreateViteProjectLoadersOptions): ProjectLoaders {
  const basePath = normalizeBasePath(options.basePath);

  return {
    async loadProject(slug, variant): Promise<ResolvedProjectConfig> {
      const variantSuffix = variant ? `-${variant}` : '';
      const theme = await resolveModule(
        pickFirst(
          options.themeModules[`${basePath}/${slug}/theme${variantSuffix}.json`],
          options.themeModules[`${basePath}/${slug}/theme.json`]
        )
      );

      const desktopFlow = await resolveModule(
        pickFirst(
          options.flowDesktopModules?.[`${basePath}/${slug}/flow${variantSuffix}-desktop.json`],
          options.flowDesktopModules?.[`${basePath}/${slug}/flow-desktop.json`],
          options.flowModules?.[`${basePath}/${slug}/flow${variantSuffix}.json`],
          options.flowModules?.[`${basePath}/${slug}/flow.json`]
        )
      );

      const mobileFlow = await resolveModule(
        pickFirst(
          options.flowMobileModules?.[`${basePath}/${slug}/flow${variantSuffix}-mobile.json`],
          options.flowMobileModules?.[`${basePath}/${slug}/flow-mobile.json`],
          options.flowModules?.[`${basePath}/${slug}/flow${variantSuffix}.json`],
          options.flowModules?.[`${basePath}/${slug}/flow.json`],
          options.flowDesktopModules?.[`${basePath}/${slug}/flow${variantSuffix}-desktop.json`],
          options.flowDesktopModules?.[`${basePath}/${slug}/flow-desktop.json`]
        )
      );

      return {
        theme,
        flows: {
          desktop: desktopFlow,
          mobile: mobileFlow,
        },
      };
    },

    async loadStepLayouts(slug, stepId, variant): Promise<LayoutPair> {
      const variantSuffix = variant ? `-${variant}` : '';
      const desktop = await resolveModule(
        pickFirst(
          options.stepModules[`${basePath}/${slug}/steps/${stepId}/desktop${variantSuffix}.json`],
          options.stepModules[`${basePath}/${slug}/steps/${stepId}/desktop.json`]
        )
      );

      const mobile = await resolveModule(
        pickFirst(
          options.stepModules[`${basePath}/${slug}/steps/${stepId}/mobile${variantSuffix}.json`],
          options.stepModules[`${basePath}/${slug}/steps/${stepId}/mobile.json`],
          options.stepModules[`${basePath}/${slug}/steps/${stepId}/desktop${variantSuffix}.json`],
          options.stepModules[`${basePath}/${slug}/steps/${stepId}/desktop.json`]
        )
      );

      return { desktop, mobile };
    },

    async loadNamedLayout(slug, layoutPath, variant): Promise<LayoutPair> {
      if (!options.namedLayoutModules) {
        throw new Error('namedLayoutModules were not provided.');
      }

      const variantSuffix = variant ? `-${variant}` : '';
      const desktop = await resolveModule(
        pickFirst(
          options.namedLayoutModules[`${basePath}/${slug}/${layoutPath}${variantSuffix}-desktop.json`],
          options.namedLayoutModules[`${basePath}/${slug}/${layoutPath}-desktop.json`]
        )
      );

      const mobile = await resolveModule(
        pickFirst(
          options.namedLayoutModules[`${basePath}/${slug}/${layoutPath}${variantSuffix}-mobile.json`],
          options.namedLayoutModules[`${basePath}/${slug}/${layoutPath}-mobile.json`],
          options.namedLayoutModules[`${basePath}/${slug}/${layoutPath}${variantSuffix}-desktop.json`],
          options.namedLayoutModules[`${basePath}/${slug}/${layoutPath}-desktop.json`]
        )
      );

      return { desktop, mobile };
    },
  };
}
