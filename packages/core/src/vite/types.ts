export type ViteImportedModule<T> = { default: T } | T;
export type ViteImportLoader<T> = () => Promise<ViteImportedModule<T>>;
export type ViteImportEntry<T> = ViteImportedModule<T> | ViteImportLoader<T>;
export type ViteModuleMap<T> = Record<string, ViteImportEntry<T>>;
