import React from 'react';

import { createViteComponentRegistry } from '../vite/createViteComponentRegistry';
import { createViteProjectLoaders } from '../vite/createViteProjectLoaders';

describe('createViteComponentRegistry', () => {
  it('creates eager registry entries from module maps', () => {
    const Hero = () => React.createElement('div', null, 'hero');
    const Footer = () => React.createElement('div', null, 'footer');

    const registry = createViteComponentRegistry({
      './components/Hero.tsx': { default: Hero },
      './components/Footer.tsx': { default: Footer },
    });

    expect(registry.Hero).toBe(Hero);
    expect(registry.Footer).toBe(Footer);
  });

  it('throws on duplicate derived keys by default', () => {
    expect(() =>
      createViteComponentRegistry({
        './components/hero.tsx': { default: () => null },
        './components/Hero.tsx': { default: () => null },
      })
    ).toThrow('Duplicate component registry key');
  });

  it('creates lazy registry entries from loader maps', () => {
    const registry = createViteComponentRegistry({
      './components/Hero.tsx': async () => ({ default: () => React.createElement('div', null, 'hero') }),
    });

    expect(registry.Hero).toBeTruthy();
    expect(typeof registry.Hero).toBe('object');
  });
});

describe('createViteProjectLoaders', () => {
  it('resolves project and step files with variant fallbacks', async () => {
    const loaders = createViteProjectLoaders({
      basePath: './landings',
      themeModules: {
        './landings/sample/theme.json': { default: { colors: { primary: '#000' } } },
      },
      flowModules: {
        './landings/sample/flow.json': { default: { steps: [{ id: 'home' }] } },
      },
      stepModules: {
        './landings/sample/steps/home/desktop.json': { default: { sections: [{ component: 'Hero' }] } },
      },
      namedLayoutModules: {
        './landings/sample/layouts/main-desktop.json': { default: { sections: [{ component: 'Hero' }] } },
        './landings/sample/layouts/main-mobile.json': { default: { sections: [{ component: 'Footer' }] } },
      },
    });

    const project = await loaders.loadProject('sample', 'A');
    const stepLayouts = await loaders.loadStepLayouts('sample', 'home', 'A');
    const namedLayout = await loaders.loadNamedLayout('sample', 'layouts/main', 'A');

    expect(project.theme.colors?.primary).toBe('#000');
    expect(project.flows.desktop.steps[0]?.id).toBe('home');
    expect(project.flows.mobile.steps[0]?.id).toBe('home');
    expect(stepLayouts.desktop.sections[0]?.component).toBe('Hero');
    expect(stepLayouts.mobile.sections[0]?.component).toBe('Hero');
    expect(namedLayout.desktop.sections[0]?.component).toBe('Hero');
    expect(namedLayout.mobile.sections[0]?.component).toBe('Footer');
  });

  it('throws when named layout modules were not configured', async () => {
    const loaders = createViteProjectLoaders({
      themeModules: {
        './landings/sample/theme.json': { default: {} },
      },
      flowModules: {
        './landings/sample/flow.json': { default: { steps: [] } },
      },
      stepModules: {
        './landings/sample/steps/home/desktop.json': { default: { sections: [] } },
      },
    });

    await expect(loaders.loadNamedLayout('sample', 'layouts/main', 'A')).rejects.toThrow('namedLayoutModules were not provided');
  });
});
