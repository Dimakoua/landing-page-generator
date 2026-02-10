import { ThemeSchema, FlowSchema, LayoutSchema, type Theme, type Flow, type Layout } from './schemas';

// Preload theme and flow JSON files using Vite's import.meta.glob
const themeModules = import.meta.glob('/src/landings/*/theme.json', { eager: true, query: '?json' });
const flowModules = import.meta.glob('/src/landings/*/flow.json', { eager: true, query: '?json' });
const desktopModules = import.meta.glob('/src/landings/*/desktop.json', { eager: true, query: '?json' });
const mobileModules = import.meta.glob('/src/landings/*/mobile.json', { eager: true, query: '?json' });

// Build maps of slug to data
const themes: Record<string, any> = {};
for (const path in themeModules) {
  const slug = path.split('/')[3];
  themes[slug] = themeModules[path];
}

const flows: Record<string, any> = {};
for (const path in flowModules) {
  const slug = path.split('/')[3];
  flows[slug] = flowModules[path];
}

const desktops: Record<string, any> = {};
for (const path in desktopModules) {
  const slug = path.split('/')[3];
  desktops[slug] = desktopModules[path];
}

const mobiles: Record<string, any> = {};
for (const path in mobileModules) {
  const slug = path.split('/')[3];
  mobiles[slug] = mobileModules[path];
}

/**
 * Resolves a project configuration by slug.
 * @param slug The landing page slug (e.g., 'sample')
 * @returns Validated theme, flow, and layouts data
 * @throws Error if project not found or validation fails
 */
export function getProjectConfig(slug: string): { theme: Theme; flow: Flow; layouts: { desktop: Layout; mobile: Layout } } {
  if (!themes[slug] || !flows[slug] || !desktops[slug] || !mobiles[slug]) {
    throw new Error(`Project "${slug}" not found. Available projects: ${Object.keys(themes).join(', ')}`);
  }

  const theme = ThemeSchema.parse(themes[slug]);
  const flow = FlowSchema.parse(flows[slug]);
  const desktop = LayoutSchema.parse(desktops[slug]);
  const mobile = LayoutSchema.parse(mobiles[slug]);

  return { theme, flow, layouts: { desktop, mobile } };
}