import type { ComponentType, LazyExoticComponent } from 'react';

import type { DispatchResult, Action, ActionContext } from './schemas/actions';
import type { Flow, Layout, Theme } from './schemas';

export type RegisteredComponent =
  | ComponentType<any>
  | LazyExoticComponent<ComponentType<any>>;

export type ComponentRegistry = Record<string, RegisteredComponent>;

export interface ResolvedProjectConfig {
  theme: Theme;
  flows: {
    desktop: Flow;
    mobile: Flow;
  };
}

export interface LayoutPair {
  desktop: Layout;
  mobile: Layout;
}

export interface ProjectLoaders {
  loadProject: (slug: string, variant?: string) => Promise<ResolvedProjectConfig>;
  loadStepLayouts: (slug: string, stepId: string, variant?: string) => Promise<LayoutPair>;
  loadNamedLayout: (slug: string, layoutPath: string, variant?: string) => Promise<LayoutPair>;
}

export interface VariantResolverInput {
  slug: string;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  url?: URL;
}

export type VariantResolver = (input: VariantResolverInput) => string | undefined;

export type EngineActionHandler = (
  action: Action,
  context: ActionContext,
  dispatch: (action: Action) => Promise<DispatchResult>,
  abortControllers?: Map<string, AbortController>
) => Promise<DispatchResult>;

export interface EngineOptions {
  components: ComponentRegistry;
  loaders: ProjectLoaders;
  actions?: Record<string, EngineActionHandler>;
  variantResolver?: VariantResolver;
}

export interface EngineRuntime {
  components: ComponentRegistry;
  loaders: ProjectLoaders;
  resolveVariant: (input: VariantResolverInput) => string | undefined;
  registerAction: (type: string, handler: EngineActionHandler) => void;
  getActionHandler: (type: string) => EngineActionHandler | undefined;
}
