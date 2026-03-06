import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SocialProof from '@/components/proof/SocialProof';
import React from 'react';

const sampleTestimonials = [
  { quote: 'X', name: 'A' },
];

describe('SocialProof component', () => {
  it('renders heading/subheading and badge if provided', () => {
    render(
      <SocialProof
        heading="H"
        subheading="S"
        badgeText="B"
        testimonials={sampleTestimonials}
      />
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders testimonials and disclaimer', () => {
    render(
      <SocialProof testimonials={sampleTestimonials} disclaimer="D" />
    );
    // quote wrapped in quotes
    expect(screen.getByText(/"X"/)).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });
});