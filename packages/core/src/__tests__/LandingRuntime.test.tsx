import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';

import { createEngine } from '../createEngine';
import { EngineProvider } from '../runtime/EngineProvider';
import { LandingRuntime } from '../runtime/LandingRuntime';

function WrapperComponent() {
  return <div>Wrapper</div>;
}

function HeroSection(props: { title: string }) {
  return <h1>{props.title}</h1>;
}

describe('LandingRuntime', () => {
  it('renders a landing using engine loaders and components', async () => {
    const engine = createEngine({
      components: {
        WrapperComponent,
        HeroSection,
      },
      loaders: {
        loadProject: async () => ({
          theme: {},
          flows: {
            desktop: {
              layout: 'layouts/main',
              seo: { title: 'Runtime Test' },
              steps: [{ id: 'home' }],
            },
            mobile: {
              layout: 'layouts/main',
              seo: { title: 'Runtime Test' },
              steps: [{ id: 'home' }],
            },
          },
        }),
        loadStepLayouts: async () => ({
          desktop: { sections: [{ component: 'HeroSection', props: { title: 'Aurora' } }] },
          mobile: { sections: [{ component: 'HeroSection', props: { title: 'Aurora' } }] },
        }),
        loadNamedLayout: async () => ({
          desktop: { sections: [{ component: 'WrapperComponent' }, { component: 'StepContent' }] },
          mobile: { sections: [{ component: 'WrapperComponent' }, { component: 'StepContent' }] },
        }),
      },
    });

    render(
      <HelmetProvider>
        <EngineProvider engine={engine}>
          <LandingRuntime slug="aurora" />
        </EngineProvider>
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Wrapper')).toBeTruthy();
      expect(screen.getByText('Aurora')).toBeTruthy();
    });
  });
});
