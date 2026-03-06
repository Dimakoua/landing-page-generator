import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WhyChooseSection from '@/components/why/WhyChooseSection';

const sampleBadges = [
  { icon: <span data-testid="icon">A</span>, title: 'T', description: 'D' },
];

const sampleGuarantee = { logoSrc: 'x', points: [{ headline: 'H', text: 'T' }] };
const sampleTestimonial = { quote: 'Q', author: 'A' };

const sampleCta = { type: 'log' } as any;

describe('WhyChooseSection component', () => {
  it('renders heading/subheading and badges', () => {
    render(
      <WhyChooseSection
        heading="H"
        subheading="S"
        badges={sampleBadges}
      />
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders guarantee block', () => {
    render(
      <WhyChooseSection
        badges={sampleBadges}
        guarantee={sampleGuarantee}
      />
    );
    expect(screen.getByText('The Guarantee')).toBeInTheDocument();
  });

  it('renders testimonial', () => {
    render(
      <WhyChooseSection
        badges={sampleBadges}
        testimonial={sampleTestimonial}
      />
    );
    // quote is wrapped in quotes so use regex
    expect(screen.getByText(/"Q"/)).toBeInTheDocument();
  });

  it('fires CTA when clicked', () => {
    const mockDispatch = vi.fn(() => Promise.resolve());
    render(
      <WhyChooseSection
        badges={sampleBadges}
        ctaLabel="Go"
        ctaAction={sampleCta}
        dispatcher={{ dispatch: mockDispatch } as any}
      />
    );
    fireEvent.click(screen.getByText('Go'));
    expect(mockDispatch).toHaveBeenCalledWith(sampleCta);
  });
});