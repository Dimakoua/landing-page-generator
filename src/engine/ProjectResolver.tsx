import { ThemeSchema, FlowSchema, LayoutSchema, type Theme, type Flow, type Layout } from '../schemas';

// Preload theme and flow JSON files using Vite's import.meta.glob
const themeModules = import.meta.glob('/src/landings/*/theme.json', { eager: true, query: '?json' });
const flowModules = import.meta.glob('/src/landings/*/flow.json', { eager: true, query: '?json' });

// Preload all step-based layouts
const layoutModules = import.meta.glob('/src/landings/*/steps/*/*.json', { eager: true, query: '?json' });

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

// Build map of slug -> stepId -> device -> layout
const layouts: Record<string, Record<string, Record<string, any>>> = {};
for (const path in layoutModules) {
  const parts = path.split('/');
  const slug = parts[3]; // landings/[slug]/steps/...
  const stepId = parts[5]; // .../steps/[stepId]/...
  const fileName = parts[6]; // desktop.json or mobile.json
  const device = fileName.replace('.json', '');

  if (!layouts[slug]) layouts[slug] = {};
  if (!layouts[slug][stepId]) layouts[slug][stepId] = {};
  layouts[slug][stepId][device] = layoutModules[path];
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

/**
 * Resolves layouts for a specific step within a project.
 * @param slug The landing page slug
 * @param stepId The step identifier
 * @returns Validated desktop and mobile layouts for the step
 * @throws Error if layouts not found or validation fails
 */
export function getStepLayouts(slug: string, stepId: string): { desktop: Layout; mobile: Layout } {
  if (!layouts[slug] || !layouts[slug][stepId]) {
    throw new Error(`Layouts for step "${stepId}" in project "${slug}" not found.`);
  }

  const desktop = LayoutSchema.parse(layouts[slug][stepId].desktop);
  const mobile = LayoutSchema.parse(layouts[slug][stepId].mobile);

  return { desktop, mobile };
}