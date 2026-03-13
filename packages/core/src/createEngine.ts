import type { EngineActionHandler, EngineOptions, EngineRuntime, VariantResolverInput } from './contracts';

function defaultVariantResolver({ slug, storage, url }: VariantResolverInput): string {
  const variantFromUrl = url?.searchParams.get('variant');
  if (variantFromUrl) {
    return variantFromUrl;
  }

  const storageKey = `ab_variant_${slug}`;
  const storedVariant = storage?.getItem(storageKey);
  if (storedVariant) {
    return storedVariant;
  }

  const defaultVariant = 'A';
  storage?.setItem?.(storageKey, defaultVariant);
  return defaultVariant;
}

export function createEngine(options: EngineOptions): EngineRuntime {
  const actionHandlers = new Map<string, EngineActionHandler>();

  Object.entries(options.actions ?? {}).forEach(([type, handler]) => {
    actionHandlers.set(type, handler);
  });

  return {
    components: options.components,
    loaders: options.loaders,
    resolveVariant: input => (options.variantResolver ?? defaultVariantResolver)(input),
    registerAction: (type, handler) => {
      actionHandlers.set(type, handler);
    },
    getActionHandler: type => actionHandlers.get(type),
  };
}
