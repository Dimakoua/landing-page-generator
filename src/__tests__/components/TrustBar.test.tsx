import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrustBar from '@/components/trust/TrustBar';
import React from 'react';

const sampleItems = [
  { icon: <span data-testid="icon1">A</span>, text: 'First' },
  { icon: <span data-testid="icon2">B</span>, text: 'Second' },
];

describe('TrustBar component', () => {
  it('renders nothing when no items provided', () => {
    const { container } = render(<TrustBar items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders each item with icon and text', () => {
    render(<TrustBar items={sampleItems} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByTestId('icon1')).toBeInTheDocument();
    expect(screen.getByTestId('icon2')).toBeInTheDocument();
  });

  it('applies wrapper classes as expected', () => {
    const { container } = render(<TrustBar items={sampleItems} />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-6');
    expect(section).toHaveClass('bg-muted/30');
    expect(section).toHaveClass('border-y');
  });
});
