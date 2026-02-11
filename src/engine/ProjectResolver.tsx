import { ThemeSchema, FlowSchema, LayoutSchema, type Theme, type Flow, type Layout } from '../schemas';

// Dynamic import modules for code-splitting per landing
const themeModules = import.meta.glob('/src/landings/*/theme*.json', { eager: false });
const flowDesktopModules = import.meta.glob('/src/landings/*/flow*-desktop.json', { eager: false });
const flowMobileModules = import.meta.glob('/src/landings/*/flow*-mobile.json', { eager: false });
const flowModules = import.meta.glob('/src/landings/*/flow*.json', { eager: false }); // Fallback
const layoutModules = import.meta.glob('/src/landings/*/steps/*/*.json', { eager: false });

// Type for JSON module imports
type JsonModule = { default: unknown };

/**
 * Resolves a project configuration by slug and optional variant.
 * @param slug The landing page slug (e.g., 'sample')
 * @param variant Optional variant identifier (e.g., 'A', 'B')
 * @returns Validated theme and flow data for desktop and mobile
 * @throws Error if project not found or validation fails
 */
export async function getProjectConfig(slug: string, variant?: string): Promise<{ theme: Theme; flows: { desktop: Flow; mobile: Flow } }> {
  const themePath = variant ? `/src/landings/${slug}/theme-${variant}.json` : `/src/landings/${slug}/theme.json`;
  const fallbackThemePath = `/src/landings/${slug}/theme.json`;
  const flowDesktopPath = variant ? `/src/landings/${slug}/flow-${variant}-desktop.json` : `/src/landings/${slug}/flow-desktop.json`;
  const flowMobilePath = variant ? `/src/landings/${slug}/flow-${variant}-mobile.json` : `/src/landings/${slug}/flow-mobile.json`;
  const flowFallbackPath = variant ? `/src/landings/${slug}/flow-${variant}.json` : `/src/landings/${slug}/flow.json`; // Fallback
  const defaultFlowFallbackPath = `/src/landings/${slug}/flow.json`; // Ultimate fallback

  if (!themeModules[themePath] && !themeModules[fallbackThemePath]) {
    throw new Error(`Project "${slug}" not found.`);
  }

  // Load theme - try variant first, then fallback
  const themeModule = await (themeModules[themePath] || themeModules[fallbackThemePath])();
  const theme = ThemeSchema.parse((themeModule as JsonModule).default);

  // Load flows - try device-specific first, then fallback
  let desktopFlow: Flow;
  let mobileFlow: Flow;

  if (flowDesktopModules[flowDesktopPath] && flowMobileModules[flowMobilePath]) {
    // Device-specific flows available for variant
    const [flowDesktopModule, flowMobileModule] = await Promise.all([
      flowDesktopModules[flowDesktopPath](),
      flowMobileModules[flowMobilePath]()
    ]);
    desktopFlow = FlowSchema.parse((flowDesktopModule as JsonModule).default);
    mobileFlow = FlowSchema.parse((flowMobileModule as JsonModule).default);
  } else if (flowModules[flowFallbackPath]) {
    // Fallback to single flow-variant.json
    const flowModule = await flowModules[flowFallbackPath]();
    const flow = FlowSchema.parse((flowModule as JsonModule).default);
    desktopFlow = flow;
    mobileFlow = flow;
  } else if (flowModules[defaultFlowFallbackPath]) {
    // Ultimate fallback to default flow.json
    const flowModule = await flowModules[defaultFlowFallbackPath]();
    const flow = FlowSchema.parse((flowModule as JsonModule).default);
    desktopFlow = flow;
    mobileFlow = flow;
  } else {
    throw new Error(`Flows for project "${slug}"${variant ? ` variant "${variant}"` : ''} not found.`);
  }

  return { theme, flows: { desktop: desktopFlow, mobile: mobileFlow } };
}

/**
 * Resolves layouts for a specific step within a project.
 * @param slug The landing page slug
 * @param stepId The step identifier
 * @param variant Optional variant identifier
 * @returns Validated desktop and mobile layouts for the step
 * @throws Error if layouts not found or validation fails
 */
export async function getStepLayouts(slug: string, stepId: string, variant?: string): Promise<{ desktop: Layout; mobile: Layout }> {
  const desktopPath = variant ? `/src/landings/${slug}/steps/${stepId}/desktop-${variant}.json` : `/src/landings/${slug}/steps/${stepId}/desktop.json`;
  const fallbackDesktopPath = `/src/landings/${slug}/steps/${stepId}/desktop.json`;
  const mobilePath = variant ? `/src/landings/${slug}/steps/${stepId}/mobile-${variant}.json` : `/src/landings/${slug}/steps/${stepId}/mobile.json`;
  const fallbackMobilePath = `/src/landings/${slug}/steps/${stepId}/mobile.json`;

  if ((!layoutModules[desktopPath] && !layoutModules[fallbackDesktopPath]) || (!layoutModules[mobilePath] && !layoutModules[fallbackMobilePath])) {
    throw new Error(`Layouts for step "${stepId}" in project "${slug}"${variant ? ` variant "${variant}"` : ''} not found.`);
  }

  const [desktopModule, mobileModule] = await Promise.all([
    (layoutModules[desktopPath] || layoutModules[fallbackDesktopPath])(),
    (layoutModules[mobilePath] || layoutModules[fallbackMobilePath])()
  ]);

  const desktop = LayoutSchema.parse((desktopModule as JsonModule).default);
  const mobile = LayoutSchema.parse((mobileModule as JsonModule).default);

  return { desktop, mobile };
}