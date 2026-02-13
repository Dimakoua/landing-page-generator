import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { keyFromPath } from '@/registry/keyFromPath';

// Ensure component-derived registry keys are unique to prevent silent overrides
describe('ComponentMap collision detection', () => {
  it('fails when two files resolve to the same registry key', () => {
    const componentsDir = path.join(process.cwd(), 'src', 'components');

    function walk(dir: string): string[] {
      const results: string[] = [];
      for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
        const res = path.join(dir, d.name);
        if (d.isDirectory()) {
          results.push(...walk(res));
        } else if (d.isFile()) {
          results.push(res);
        }
      }
      return results;
    }

    const allFiles = walk(componentsDir);
    const componentFiles = allFiles.filter(f => /[A-Za-z0-9_@].*\.(tsx|ts|jsx|js)$/.test(path.basename(f)));

    const map = new Map<string, string[]>();

    for (const file of componentFiles) {
      const rel = path.relative(componentsDir, file).replace(/\\/g, '/');
      const modulePath = `../components/${rel}`;
      const key = keyFromPath(modulePath);
      const existing = map.get(key) || [];
      existing.push(modulePath);
      map.set(key, existing);
    }

    const collisions = Array.from(map.entries()).filter(([, arr]) => arr.length > 1);

    if (collisions.length > 0) {
      const formatted = collisions
        .map(([k, files]) => `"${k}" => ${files.join(', ')}`)
        .join('\n');
      throw new Error(`Component registry key collisions detected:\n${formatted}`);
    }

    expect(collisions.length).toBe(0);
  });
});
