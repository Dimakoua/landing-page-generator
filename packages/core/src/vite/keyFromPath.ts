export function keyFromPath(path: string): string {
  const parts = path.split('/');
  const file = parts[parts.length - 1] ?? '';

  if (/^index\./i.test(file)) {
    const folder = parts[parts.length - 2] ?? 'Unknown';
    return folder
      .replace(/[-_](.)/g, (_, char: string) => char.toUpperCase())
      .replace(/^(.)/, char => char.toUpperCase());
  }

  const name = file.replace(/\.[^.]+$/, '');
  return name
    .replace(/[-_](.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^(.)/, char => char.toUpperCase());
}
