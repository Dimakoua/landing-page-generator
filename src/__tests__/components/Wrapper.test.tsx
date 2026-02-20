import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Wrapper from '@/components/wrapper/Wrapper';
import { ActionDispatcher } from '@/engine/ActionDispatcher';
import * as renderSectionMod from '@/engine/utils/renderSection';
import '@testing-library/jest-dom';

vi.mock('@/engine/utils/renderSection', () => ({
  renderSection: vi.fn(({ index }) => <div key={index} data-testid="child">Child {index}</div>),
}));

describe('Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProps = {
    sections: [
      { component: 'Hero', props: { title: 'Test' } },
      { component: 'Testimonials', props: { items: [] } },
    ],
    dispatcher: {} as ActionDispatcher,
    state: {},
    slug: 'test',
    className: 'test-wrapper',
  };

  it('renders a wrapper with default div tag and className', () => {
    const { container } = render(<Wrapper {...mockProps} />);
    const div = container.querySelector('div.test-wrapper');
    expect(div).toBeInTheDocument();
  });

  it('renders a wrapper with specified tag', () => {
    const { container } = render(<Wrapper {...mockProps} tag="section" />);
    const section = container.querySelector('section.test-wrapper');
    expect(section).toBeInTheDocument();
  });

  it('calls renderSection for each section', () => {
    render(<Wrapper {...mockProps} />);
    expect(renderSectionMod.renderSection).toHaveBeenCalledTimes(2);
    expect(screen.getAllByTestId('child')).toHaveLength(2);
  });

  it('returns null if sections is not an array', () => {
    const { container } = render(<Wrapper {...mockProps} sections={null as any} />);
    expect(container.firstChild).toBeNull();
  });
});
