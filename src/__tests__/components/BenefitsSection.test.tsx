import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BenefitsSection from '@/components/benefits/BenefitsSection';

const sampleBenefits = [
  {
    icon: <span data-testid="icon1">I</span>,
    title: 'Test Benefit',
    description: 'Description',
  },
];

const sampleBundle = [
  {
    imageSrc: '/test.jpg',
    title: 'Bundle',
    description: 'desc',
    price: '$10',
    ctaLabel: 'Buy',
  },
];

const sampleScience = {
  headline: 'Science',
  copy: 'copy',
  boxCopy: 'box',
};

const sampleFaqs = [
  { question: 'Q', answer: 'A' },
];

describe('BenefitsSection component', () => {
  it('renders heading and subheading', () => {
    render(
      <BenefitsSection
        heading="H"
        subheading="S"
        benefits={sampleBenefits}
      />
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders benefits grid', () => {
    render(<BenefitsSection benefits={sampleBenefits} />);
    expect(screen.getByText('Test Benefit')).toBeInTheDocument();
  });

  it('renders bundles when provided', () => {
    render(<BenefitsSection benefits={sampleBenefits} bundles={sampleBundle} />);
    expect(screen.getByText('Bundle')).toBeInTheDocument();
    expect(screen.getByText('Buy')).toBeInTheDocument();
  });

  it('renders science block if given', () => {
    render(<BenefitsSection benefits={sampleBenefits} science={sampleScience} />);
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('box')).toBeInTheDocument();
  });

  it('renders FAQs if provided', () => {
    render(<BenefitsSection benefits={sampleBenefits} faqs={sampleFaqs} />);
    expect(screen.getByText('Q')).toBeInTheDocument();
  });

  it('fires CTA action when button clicked', () => {
    const mockDispatch = vi.fn(() => Promise.resolve());
    render(
      <BenefitsSection
        benefits={sampleBenefits}
        cta={{ label: 'Go', action: { type: 'log' } as any }}
        dispatcher={{ dispatch: mockDispatch } as any}
      />
    );
    fireEvent.click(screen.getByText('Go'));
    expect(mockDispatch).toHaveBeenCalled();
  });
});