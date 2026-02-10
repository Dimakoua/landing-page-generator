import { ThemeSchema, FlowSchema, type Theme, type Flow } from './schemas';

// Preload theme and flow JSON files using Vite's import.meta.glob
const themeModules = import.meta.glob('/src/landings/*/theme.json', { eager: true, as: 'json' });
const flowModules = import.meta.glob('/src/landings/*/flow.json', { eager: true, as: 'json' });

// Build maps of slug to data
const themes: Record<string, any> = {};
for (const path in themeModules) {
  const slug = path.split('/')[3]; // Extract slug from /src/landings/slug/theme.json
  themes[slug] = themeModules[path];
}

const flows: Record<string, any> = {};
for (const path in flowModules) {
  const slug = path.split('/')[3]; // Extract slug from /src/landings/slug/flow.json
  flows[slug] = flowModules[path];
}

/**
 * Resolves a project configuration by slug.
 * @param slug The landing page slug (e.g., 'sample')
 * @returns Validated theme and flow data
 * @throws Error if project not found or validation fails
 */
export function getProjectConfig(slug: string): { theme: Theme; flow: Flow } {
  if (!themes[slug] || !flows[slug]) {
    throw new Error(`Project "${slug}" not found. Available projects: ${Object.keys(themes).join(', ')}`);
  }

  const theme = ThemeSchema.parse(themes[slug]);
  const flow = FlowSchema.parse(flows[slug]);

  return { theme, flow };
}