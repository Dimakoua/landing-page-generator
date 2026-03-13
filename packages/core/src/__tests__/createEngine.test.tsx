import { render, screen } from '@testing-library/react';

import { createEngine } from '../createEngine';
import { EngineProvider } from '../runtime/EngineProvider';
import { useEngine } from '../runtime/useEngine';

function Consumer() {
  const engine = useEngine();
  return <div>{Object.keys(engine.components).join(',')}</div>;
}

describe('createEngine', () => {
  it('stores component and loader registrations', async () => {
    const engine = createEngine({
      components: {
        Hero: () => null,
      },
      loaders: {
        loadProject: async () => ({
          theme: {},
          flows: {
            desktop: { steps: [] },
            mobile: { steps: [] },
          },
        }),
        loadStepLayouts: async () => ({
          desktop: { sections: [] },
          mobile: { sections: [] },
        }),
        loadNamedLayout: async () => ({
          desktop: { sections: [] },
          mobile: { sections: [] },
        }),
      },
    });

    const resolved = await engine.loaders.loadProject('sample');

    expect(Object.keys(engine.components)).toEqual(['Hero']);
    expect(resolved.flows.desktop.steps).toEqual([]);
  });

  it('registers custom action handlers', async () => {
    const engine = createEngine({
      components: {},
      loaders: {
        loadProject: async () => ({ theme: {}, flows: { desktop: { steps: [] }, mobile: { steps: [] } } }),
        loadStepLayouts: async () => ({ desktop: { sections: [] }, mobile: { sections: [] } }),
        loadNamedLayout: async () => ({ desktop: { sections: [] }, mobile: { sections: [] } }),
      },
    });

    const handler = vi.fn().mockResolvedValue({ success: true });
    engine.registerAction('plugin:test', handler);

    const found = engine.getActionHandler('plugin:test');

    expect(found).toBe(handler);
    await found?.({ type: 'plugin', name: 'test' }, {
      state: {},
      getState: () => undefined,
      setState: () => undefined,
      navigate: () => undefined,
    }, async () => ({ success: true }));
    expect(handler).toHaveBeenCalled();
  });

  it('provides the engine through React context', () => {
    const engine = createEngine({
      components: {
        Hero: () => null,
      },
      loaders: {
        loadProject: async () => ({ theme: {}, flows: { desktop: { steps: [] }, mobile: { steps: [] } } }),
        loadStepLayouts: async () => ({ desktop: { sections: [] }, mobile: { sections: [] } }),
        loadNamedLayout: async () => ({ desktop: { sections: [] }, mobile: { sections: [] } }),
      },
    });

    render(
      <EngineProvider engine={engine}>
        <Consumer />
      </EngineProvider>
    );

    expect(screen.getByText('Hero')).toBeTruthy();
  });
});
