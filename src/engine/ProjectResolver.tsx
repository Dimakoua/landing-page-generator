import { ThemeSchema, FlowSchema, LayoutSchema, type Theme, type Flow, type Layout } from '../schemas';

// Dynamic import modules for code-splitting per landing
const themeModules = import.meta.glob('/src/landings/*/theme.json', { eager: false });
const flowDesktopModules = import.meta.glob('/src/landings/*/flow-desktop.json', { eager: false });
const flowMobileModules = import.meta.glob('/src/landings/*/flow-mobile.json', { eager: false });
const flowModules = import.meta.glob('/src/landings/*/flow.json', { eager: false }); // Fallback
const layoutModules = import.meta.glob('/src/landings/*/steps/*/*.json', { eager: false });

// Type for JSON module imports
type JsonModule = { default: unknown };

/**
 * Resolves a project configuration by slug.
 * @param slug The landing page slug (e.g., 'sample')
 * @returns Validated theme and flow data for desktop and mobile
 * @throws Error if project not found or validation fails
 */
export async function getProjectConfig(slug: string): Promise<{ theme: Theme; flows: { desktop: Flow; mobile: Flow } }> {
  const themePath = `/src/landings/${slug}/theme.json`;
  const flowDesktopPath = `/src/landings/${slug}/flow-desktop.json`;
  const flowMobilePath = `/src/landings/${slug}/flow-mobile.json`;
  const flowFallbackPath = `/src/landings/${slug}/flow.json`; // Fallback for backward compatibility

  if (!themeModules[themePath]) {
    throw new Error(`Project "${slug}" not found.`);
  }

  // Load theme
  const themeModule = await themeModules[themePath]();
  const theme = ThemeSchema.parse((themeModule as JsonModule).default);

  // Load flows - try device-specific first, then fallback
  let desktopFlow: Flow;
  let mobileFlow: Flow;

  if (flowDesktopModules[flowDesktopPath] && flowMobileModules[flowMobilePath]) {
    // Device-specific flows available
    const [flowDesktopModule, flowMobileModule] = await Promise.all([
      flowDesktopModules[flowDesktopPath](),
      flowMobileModules[flowMobilePath]()
    ]);
    desktopFlow = FlowSchema.parse((flowDesktopModule as JsonModule).default);
    mobileFlow = FlowSchema.parse((flowMobileModule as JsonModule).default);
  } else if (flowModules[flowFallbackPath]) {
    // Fallback to single flow.json
    const flowModule = await flowModules[flowFallbackPath]();
    const flow = FlowSchema.parse((flowModule as JsonModule).default);
    desktopFlow = flow;
    mobileFlow = flow;
  } else {
    throw new Error(`Flows for project "${slug}" not found.`);
  }

  return { theme, flows: { desktop: desktopFlow, mobile: mobileFlow } };
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