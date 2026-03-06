import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GummyAdvantages from '@/components/advantages/GummyAdvantages';

const sampleFeatures = [
  {
    icon: <span data-testid="icon1">A</span>,
    title: 'One',
    description: 'Desc',
  },
];

const sampleImage: any = {
  src: 'test.jpg',
  ctaLabel: 'Go',
  ctaAction: { type: 'navigate', url: '/buy' },
};

const sampleComparisons = [
  {
    feature: 'Feat',
    ours: { text: 'Y' },
    theirs: { text: 'N' },
  },
];

const sampleCallout = {
  headline: 'H',
  copy: 'C',
};

describe('GummyAdvantages component', () => {
  it('renders heading and subheading', () => {
    render(
      <GummyAdvantages
        heading="H"
        subheading="S"
        features={sampleFeatures}
      />
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders features grid', () => {
    render(<GummyAdvantages features={sampleFeatures} />);
    expect(screen.getByText('One')).toBeInTheDocument();
  });

  it('renders image with CTA', () => {
    const mockDispatch = vi.fn(() => Promise.resolve());
    render(
      <GummyAdvantages
        features={sampleFeatures}
        image={sampleImage}
        dispatcher={{ dispatch: mockDispatch } as any}
      />
    );
    fireEvent.click(screen.getByText('Go'));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders comparison table', () => {
    render(
      <GummyAdvantages
        features={sampleFeatures}
        comparisons={sampleComparisons}
      />
    );
    expect(screen.getByText('Feat')).toBeInTheDocument();
  });

  it('renders callout block', () => {
    render(
      <GummyAdvantages
        features={sampleFeatures}
        callout={sampleCallout}
      />
    );
    expect(screen.getByText('H')).toBeInTheDocument();
  });
});