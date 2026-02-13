// Utility to derive ComponentMap registry key from a module path
// Kept as a single source of truth so tests can reuse the same logic.
export function keyFromPath(path: string): string {
  const parts = path.split('/');
  const file = parts[parts.length - 1];

  if (/^index\./i.test(file)) {
    const folder = parts[parts.length - 2];
    return folder.replace(/[-_](.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, s => s.toUpperCase());
  }

  const name = file.replace(/\.[^.]+$/, '');
  return name.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
}
