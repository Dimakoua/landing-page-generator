import { ThemeSchema, FlowSchema, LayoutSchema, type Theme, type Flow, type Layout } from '../schemas';

// Dynamic import modules for code-splitting per landing
const themeModules = import.meta.glob('/src/landings/*/theme.json', { eager: false });
const flowModules = import.meta.glob('/src/landings/*/flow.json', { eager: false });
const layoutModules = import.meta.glob('/src/landings/*/steps/*/*.json', { eager: false });

// Type for JSON module imports
type JsonModule = { default: unknown };

/**
 * Resolves a project configuration by slug.
 * @param slug The landing page slug (e.g., 'sample')
 * @returns Validated theme and flow data
 * @throws Error if project not found or validation fails
 */
export async function getProjectConfig(slug: string): Promise<{ theme: Theme; flow: Flow }> {
  const themePath = `/src/landings/${slug}/theme.json`;
  const flowPath = `/src/landings/${slug}/flow.json`;

  if (!themeModules[themePath] || !flowModules[flowPath]) {
    throw new Error(`Project "${slug}" not found.`);
  }

  const [themeModule, flowModule] = await Promise.all([
    themeModules[themePath](),
    flowModules[flowPath]()
  ]);

  const theme = ThemeSchema.parse((themeModule as JsonModule).default);
  const flow = FlowSchema.parse((flowModule as JsonModule).default);

  return { theme, flow };
}

/**
 * Resolves layouts for a specific step within a project.
 * @param slug The landing page slug
 * @param stepId The step identifier
 * @returns Validated desktop and mobile layouts for the step
 * @throws Error if layouts not found or validation fails
 */
export async function getStepLayouts(slug: string, stepId: string): Promise<{ desktop: Layout; mobile: Layout }> {
  const desktopPath = `/src/landings/${slug}/steps/${stepId}/desktop.json`;
  const mobilePath = `/src/landings/${slug}/steps/${stepId}/mobile.json`;

  if (!layoutModules[desktopPath] || !layoutModules[mobilePath]) {
    throw new Error(`Layouts for step "${stepId}" in project "${slug}" not found.`);
  }

  const [desktopModule, mobileModule] = await Promise.all([
    layoutModules[desktopPath](),
    layoutModules[mobilePath]()
  ]);

  const desktop = LayoutSchema.parse((desktopModule as JsonModule).default);
  const mobile = LayoutSchema.parse((mobileModule as JsonModule).default);

  return { desktop, mobile };
}