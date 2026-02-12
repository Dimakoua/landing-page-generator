import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Hero from '@/components/hero/Hero';

describe('Hero (product) color picker', () => {
  const colors = [
    { id: 'blue', label: 'Midnight Blue', color: '#135bec' },
    { id: 'black', label: 'Charcoal', color: '#0f172a' },
    { id: 'stone', label: 'Stone', color: '#e6e6e9' },
  ];

  it('renders color options from props and updates selected color', () => {
    render(<Hero title="Test" images={[{ src: 'img.jpg' }]} colors={colors} />);

    // label shows the initially selected color (first in list)
    expect(screen.getByText(/Midnight Blue/i)).toBeInTheDocument();

    // find the button for the second color and click
    const colorButtons = screen.getAllByRole('button', { name: /Midnight Blue|Charcoal|Stone/ });
    // clicking the charcoal button (second) — note: exact accessible name might vary so use index
    fireEvent.click(colorButtons[1]);

    // label should update to Charcoal
    expect(screen.getByText(/Charcoal/i)).toBeInTheDocument();

    // the selected button should have aria-pressed=true
    expect(colorButtons[1]).toHaveAttribute('aria-pressed', 'true');
  });
});