import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StepsSection from '@/components/steps/StepsSection';

const sampleSteps = [
  {
    icon: <span data-testid="icon">X</span>,
    title: 'One',
    description: 'D1',
  },
];

const sampleCta: any = { type: 'navigate', url: '/go' };

describe('StepsSection component', () => {
  it('renders heading/subheading and steps', () => {
    render(
      <StepsSection
        heading="H"
        subheading="S"
        steps={sampleSteps}
      />
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('One')).toBeInTheDocument();
  });

  it('fires CTA action when button clicked', () => {
    const mockDispatch = vi.fn(() => Promise.resolve());
    render(
      <StepsSection
        steps={sampleSteps}
        ctaLabel="Go now"
        ctaAction={sampleCta}
        dispatcher={{ dispatch: mockDispatch } as any}
      />
    );
    fireEvent.click(screen.getByText('Go now'));
    expect(mockDispatch).toHaveBeenCalledWith(sampleCta);
  });
});