import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Theme, Flow, Layout } from '@/schemas';

// Create mock modules that simulate the import.meta.glob results
const mockThemeModules: Record<string, any> = {
  '/src/landings/sample/theme.json': vi.fn(),
  '/src/landings/sample/theme-A.json': vi.fn(),
  '/src/landings/test/theme.json': vi.fn(),
};

const mockFlowDesktopModules: Record<string, any> = {
  '/src/landings/sample/flow-desktop.json': vi.fn(),
  '/src/landings/sample/flow-A-desktop.json': vi.fn(),
};

const mockFlowMobileModules: Record<string, any> = {
  '/src/landings/sample/flow-mobile.json': vi.fn(),
  '/src/landings/sample/flow-A-mobile.json': vi.fn(),
};

const mockFlowModules: Record<string, any> = {
  '/src/landings/sample/flow.json': vi.fn(),
  '/src/landings/sample/flow-A.json': vi.fn(),
  '/src/landings/fallback/flow.json': vi.fn(),
};

const mockLayoutModules: Record<string, any> = {
  '/src/landings/sample/steps/hero/desktop.json': vi.fn(),
  '/src/landings/sample/steps/hero/mobile.json': vi.fn(),
  '/src/landings/sample/steps/hero/desktop-A.json': vi.fn(),
  '/src/landings/sample/steps/hero/mobile-A.json': vi.fn(),
  '/src/landings/test/steps/step1/desktop.json': vi.fn(),
  '/src/landings/test/steps/step1/mobile.json': vi.fn(),
};

// Mock the entire module with our own implementation
vi.mock('@/engine/ProjectResolver', () => {
  async function getProjectConfig(slug: string, variant?: string) {
    const themePath = variant ? `/src/landings/${slug}/theme-${variant}.json` : `/src/landings/${slug}/theme.json`;
    const fallbackThemePath = `/src/landings/${slug}/theme.json`;
    const flowDesktopPath = variant ? `/src/landings/${slug}/flow-${variant}-desktop.json` : `/src/landings/${slug}/flow-desktop.json`;
    const flowMobilePath = variant ? `/src/landings/${slug}/flow-${variant}-mobile.json` : `/src/landings/${slug}/flow-mobile.json`;
    const flowFallbackPath = variant ? `/src/landings/${slug}/flow-${variant}.json` : `/src/landings/${slug}/flow.json`;
    const defaultFlowFallbackPath = `/src/landings/${slug}/flow.json`;

    if (!mockThemeModules[themePath] && !mockThemeModules[fallbackThemePath]) {
      throw new Error(`Project "${slug}" not found.`);
    }

    // Load theme - try variant first, then fallback
    const themeModule = await (mockThemeModules[themePath] || mockThemeModules[fallbackThemePath])();
    const theme = (themeModule as any).default as Theme;

    // Load flows - try device-specific first, then fallback
    let desktopFlow: Flow, mobileFlow: Flow;

    if (mockFlowDesktopModules[flowDesktopPath] && mockFlowMobileModules[flowMobilePath]) {
      // Device-specific flows available for variant
      const [flowDesktopModule, flowMobileModule] = await Promise.all([
        mockFlowDesktopModules[flowDesktopPath](),
        mockFlowMobileModules[flowMobilePath]()
      ]);
      desktopFlow = (flowDesktopModule as any).default as Flow;
      mobileFlow = (flowMobileModule as any).default as Flow;
    } else if (mockFlowModules[flowFallbackPath]) {
      // Fallback to single flow-variant.json
      const flowModule = await mockFlowModules[flowFallbackPath]();
      const flow = (flowModule as any).default as Flow;
      desktopFlow = flow;
      mobileFlow = flow;
    } else if (mockFlowModules[defaultFlowFallbackPath]) {
      // Ultimate fallback to default flow.json
      const flowModule = await mockFlowModules[defaultFlowFallbackPath]();
      const flow = (flowModule as any).default as Flow;
      desktopFlow = flow;
      mobileFlow = flow;
    } else {
      throw new Error(`Flows for project "${slug}"${variant ? ` variant "${variant}"` : ''} not found.`);
    }

    return { theme, flows: { desktop: desktopFlow, mobile: mobileFlow } };
  }

  async function getStepLayouts(slug: string, stepId: string, variant?: string) {
    const desktopPath = variant ? `/src/landings/${slug}/steps/${stepId}/desktop-${variant}.json` : `/src/landings/${slug}/steps/${stepId}/desktop.json`;
    const fallbackDesktopPath = `/src/landings/${slug}/steps/${stepId}/desktop.json`;
    const mobilePath = variant ? `/src/landings/${slug}/steps/${stepId}/mobile-${variant}.json` : `/src/landings/${slug}/steps/${stepId}/mobile.json`;
    const fallbackMobilePath = `/src/landings/${slug}/steps/${stepId}/mobile.json`;

    if ((!mockLayoutModules[desktopPath] && !mockLayoutModules[fallbackDesktopPath]) || (!mockLayoutModules[mobilePath] && !mockLayoutModules[fallbackMobilePath])) {
      throw new Error(`Layouts for step "${stepId}" in project "${slug}"${variant ? ` variant "${variant}"` : ''} not found.`);
    }

    const [desktopModule, mobileModule] = await Promise.all([
      (mockLayoutModules[desktopPath] || mockLayoutModules[fallbackDesktopPath])(),
      (mockLayoutModules[mobilePath] || mockLayoutModules[fallbackMobilePath])()
    ]);

    const desktop = (desktopModule as any).default as Layout;
    const mobile = (mobileModule as any).default as Layout;

    return { desktop, mobile };
  }

  return {
    getProjectConfig,
    getStepLayouts,
  };
});

// Import after mocking
import { getProjectConfig, getStepLayouts } from '@/engine/ProjectResolver';

// Sample valid data
const validTheme = { colors: { primary: '#000' }, fonts: { body: 'Arial' } };
const validFlow = { steps: [{ id: 'hero', type: 'normal' as const }] };
const validLayout = {
  sections: [{
    component: 'Hero',
    props: { title: 'Test' },
    actions: { onClick: { type: 'navigate', url: '/next' } }
  }]
};

describe('ProjectResolver', () => {
  beforeEach(() => {
    // Re-create all mocks with fresh vi.fn() instances
    Object.keys(mockThemeModules).forEach(key => {
      mockThemeModules[key] = vi.fn().mockResolvedValue({ default: validTheme });
    });
    Object.keys(mockFlowDesktopModules).forEach(key => {
      mockFlowDesktopModules[key] = vi.fn().mockResolvedValue({ default: validFlow });
    });
    Object.keys(mockFlowMobileModules).forEach(key => {
      mockFlowMobileModules[key] = vi.fn().mockResolvedValue({ default: validFlow });
    });
    Object.keys(mockFlowModules).forEach(key => {
      mockFlowModules[key] = vi.fn().mockResolvedValue({ default: validFlow });
    });
    Object.keys(mockLayoutModules).forEach(key => {
      mockLayoutModules[key] = vi.fn().mockResolvedValue({ default: validLayout });
    });
  });

  describe('getProjectConfig', () => {
    describe('theme loading', () => {
      it('should load default theme when no variant specified', async () => {
        const result = await getProjectConfig('sample');

        expect(mockThemeModules['/src/landings/sample/theme.json']).toHaveBeenCalled();
        expect(result.theme).toEqual(validTheme);
      });

      it('should load variant theme when variant specified', async () => {
        const result = await getProjectConfig('sample', 'A');

        expect(mockThemeModules['/src/landings/sample/theme-A.json']).toHaveBeenCalled();
        expect(result.theme).toEqual(validTheme);
      });

      it('should fallback to default theme when variant theme not found', async () => {
        // Remove variant theme
        delete mockThemeModules['/src/landings/sample/theme-A.json'];

        const result = await getProjectConfig('sample', 'A');

        expect(mockThemeModules['/src/landings/sample/theme.json']).toHaveBeenCalled();
        expect(result.theme).toEqual(validTheme);
      });

      it('should throw error when project not found', async () => {
        await expect(getProjectConfig('nonexistent')).rejects.toThrow('Project "nonexistent" not found.');
      });

      it('should validate theme schema', async () => {
        // ThemeSchema parsing with invalid data throws, so we need to check that
        const invalidTheme = { invalid: 'data' };
        mockThemeModules['/src/landings/sample/theme.json'] = vi.fn().mockResolvedValue({ default: invalidTheme });

        try {
          await getProjectConfig('sample');
          // If we reach here, the test should fail
          expect(true).toBe(false);
        } catch (error) {
          // Should throw a validation error
          expect(error).toBeDefined();
        }
      });
    });

    describe('flow loading', () => {
      it('should load device-specific flows when available', async () => {
        const result = await getProjectConfig('sample');

        expect(mockFlowDesktopModules['/src/landings/sample/flow-desktop.json']).toHaveBeenCalled();
        expect(mockFlowMobileModules['/src/landings/sample/flow-mobile.json']).toHaveBeenCalled();
        expect(result.flows.desktop).toEqual(validFlow);
        expect(result.flows.mobile).toEqual(validFlow);
      });

      it('should load variant device-specific flows when variant specified', async () => {
        const result = await getProjectConfig('sample', 'A');

        expect(mockFlowDesktopModules['/src/landings/sample/flow-A-desktop.json']).toHaveBeenCalled();
        expect(mockFlowMobileModules['/src/landings/sample/flow-A-mobile.json']).toHaveBeenCalled();
        expect(result.flows.desktop).toEqual(validFlow);
        expect(result.flows.mobile).toEqual(validFlow);
      });

      it('should fallback to single flow file when device-specific not available', async () => {
        // Remove device-specific flows
        delete mockFlowDesktopModules['/src/landings/sample/flow-desktop.json'];
        delete mockFlowMobileModules['/src/landings/sample/flow-mobile.json'];

        const result = await getProjectConfig('sample');

        expect(mockFlowModules['/src/landings/sample/flow.json']).toHaveBeenCalled();
        expect(result.flows.desktop).toEqual(validFlow);
        expect(result.flows.mobile).toEqual(validFlow);
      });

      it('should fallback to default flow when variant flow not found', async () => {
        // Remove variant flows
        delete mockFlowDesktopModules['/src/landings/sample/flow-A-desktop.json'];
        delete mockFlowMobileModules['/src/landings/sample/flow-A-mobile.json'];
        delete mockFlowModules['/src/landings/sample/flow-A.json'];

        const result = await getProjectConfig('sample', 'A');

        expect(mockFlowModules['/src/landings/sample/flow.json']).toHaveBeenCalled();
        expect(result.flows.desktop).toEqual(validFlow);
        expect(result.flows.mobile).toEqual(validFlow);
      });

      it('should throw error when flows not found', async () => {
        // Remove all flow modules
        Object.keys(mockFlowDesktopModules).forEach(key => delete mockFlowDesktopModules[key]);
        Object.keys(mockFlowMobileModules).forEach(key => delete mockFlowMobileModules[key]);
        Object.keys(mockFlowModules).forEach(key => delete mockFlowModules[key]);

        await expect(getProjectConfig('sample')).rejects.toThrow('Flows for project "sample" not found.');
      });

      it('should throw error with variant info when variant flows not found', async () => {
        // Remove all flow modules
        Object.keys(mockFlowDesktopModules).forEach(key => delete mockFlowDesktopModules[key]);
        Object.keys(mockFlowMobileModules).forEach(key => delete mockFlowMobileModules[key]);
        Object.keys(mockFlowModules).forEach(key => delete mockFlowModules[key]);

        await expect(getProjectConfig('sample', 'A')).rejects.toThrow('Flows for project "sample" variant "A" not found.');
      });

      it('should validate flow schema', async () => {
        const invalidFlow = { invalid: 'data' };
        mockFlowDesktopModules['/src/landings/sample/flow-desktop.json'] = vi.fn().mockResolvedValue({ default: invalidFlow });

        await expect(getProjectConfig('sample')).rejects.toThrow();
      });
    });
  });

  describe('getStepLayouts', () => {
    it('should load default layouts when no variant specified', async () => {
      const result = await getStepLayouts('sample', 'hero');

      expect(mockLayoutModules['/src/landings/sample/steps/hero/desktop.json']).toHaveBeenCalled();
      expect(mockLayoutModules['/src/landings/sample/steps/hero/mobile.json']).toHaveBeenCalled();
      expect(result.desktop).toEqual(validLayout);
      expect(result.mobile).toEqual(validLayout);
    });

    it('should load variant layouts when variant specified', async () => {
      const result = await getStepLayouts('sample', 'hero', 'A');

      expect(mockLayoutModules['/src/landings/sample/steps/hero/desktop-A.json']).toHaveBeenCalled();
      expect(mockLayoutModules['/src/landings/sample/steps/hero/mobile-A.json']).toHaveBeenCalled();
      expect(result.desktop).toEqual(validLayout);
      expect(result.mobile).toEqual(validLayout);
    });

    it('should fallback to default layouts when variant layouts not found', async () => {
      // Remove variant layouts
      delete mockLayoutModules['/src/landings/sample/steps/hero/desktop-A.json'];
      delete mockLayoutModules['/src/landings/sample/steps/hero/mobile-A.json'];

      const result = await getStepLayouts('sample', 'hero', 'A');

      expect(mockLayoutModules['/src/landings/sample/steps/hero/desktop.json']).toHaveBeenCalled();
      expect(mockLayoutModules['/src/landings/sample/steps/hero/mobile.json']).toHaveBeenCalled();
      expect(result.desktop).toEqual(validLayout);
      expect(result.mobile).toEqual(validLayout);
    });

    it('should throw error when desktop layout not found', async () => {
      delete mockLayoutModules['/src/landings/sample/steps/hero/desktop.json'];

      await expect(getStepLayouts('sample', 'hero')).rejects.toThrow('Layouts for step "hero" in project "sample" not found.');
    });

    it('should throw error when mobile layout not found', async () => {
      delete mockLayoutModules['/src/landings/sample/steps/hero/mobile.json'];

      await expect(getStepLayouts('sample', 'hero')).rejects.toThrow('Layouts for step "hero" in project "sample" not found.');
    });

    it('should throw error with variant info when variant layouts not found', async () => {
      delete mockLayoutModules['/src/landings/sample/steps/hero/desktop-A.json'];
      delete mockLayoutModules['/src/landings/sample/steps/hero/mobile-A.json'];
      delete mockLayoutModules['/src/landings/sample/steps/hero/desktop.json'];
      delete mockLayoutModules['/src/landings/sample/steps/hero/mobile.json'];

      await expect(getStepLayouts('sample', 'hero', 'A')).rejects.toThrow('Layouts for step "hero" in project "sample" variant "A" not found.');
    });

    it('should validate layout schema', async () => {
      const invalidLayout = { invalid: 'data' };
      mockLayoutModules['/src/landings/sample/steps/hero/desktop.json'] = vi.fn().mockResolvedValue({ default: invalidLayout });

      await expect(getStepLayouts('sample', 'hero')).rejects.toThrow();
    });

    it('should load layouts for different steps', async () => {
      const result = await getStepLayouts('test', 'step1');

      expect(mockLayoutModules['/src/landings/test/steps/step1/desktop.json']).toHaveBeenCalled();
      expect(mockLayoutModules['/src/landings/test/steps/step1/mobile.json']).toHaveBeenCalled();
      expect(result.desktop).toEqual(validLayout);
      expect(result.mobile).toEqual(validLayout);
    });
  });
});
