import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderSection } from '@/engine/utils/renderSection';
import ComponentMap from '@/registry/ComponentMap';
import type { ActionDispatcher } from '@/engine/ActionDispatcher';

vi.mock('@/registry/ComponentMap', () => ({
  default: {
    // Hero mock as a regular component (not lazy for easier testing)
    Hero: ({ actions }: any) => <div data-testid="hero">{JSON.stringify(actions)}</div>,
  },
}));

describe('renderSection normalization', () => {
  const mockProps = {
    interpolateObject: (obj: any) => obj,
    engineState: {},
    dispatcher: {} as ActionDispatcher,
    slug: 'test',
  };

  it('normalizes action arrays for a component', () => {
    const section = {
      component: 'Hero',
      actions: {
        click: [
          { type: 'log', message: '1' },
          { type: 'log', message: '2' }
        ]
      }
    } as any;

    render(renderSection({ ...mockProps, section, index: 0 }));

    const hero = screen.getByTestId('hero');
    const actions = JSON.parse(hero.textContent || '{}');
    expect(actions.click).toEqual({
      type: 'chain',
      actions: [
        { type: 'log', message: '1' },
        { type: 'log', message: '2' }
      ]
    });
  });
});
