import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Testimonials from '@/components/testimonials/Testimonials';

const testimonials = [
  { rating: 5, content: 'Great product', name: 'A', role: 'Verified Buyer', image: '1.jpg' },
  { rating: 5, content: 'Fantastic', name: 'B', role: 'Music Producer', image: '2.jpg' },
  { rating: 4.5, content: 'Solid build', name: 'C', role: 'Verified Buyer', image: '3.jpg' },
];

describe('Testimonials component', () => {
  it('renders testimonials as cards with name, role and quote', () => {
    render(<Testimonials testimonials={testimonials} title="Loved by Audiophiles" />);

    expect(screen.getByText('Loved by Audiophiles')).toBeInTheDocument();
    expect(screen.getByText('Great product')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Music Producer')).toBeInTheDocument();

    // check that the quotes have italic styling class (not strict, but present)
    const quotes = screen.getAllByText(/Great product|Fantastic|Solid build/);
    quotes.forEach(q => expect(q).toHaveClass('italic'));
  });
});