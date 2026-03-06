import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CtaSection from '@/components/cta/CtaSection';

const sample = {
  heading: 'Hello World',
  subheading: 'This is a subtitle',
  buttonLabel: 'Click me',
  guaranteeText: 'Guaranteed',
};

describe('CtaSection component', () => {
  it('renders heading, subheading and guarantee', () => {
    render(<CtaSection {...sample} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
    expect(screen.getByText('Guaranteed')).toBeInTheDocument();
  });

  it('fires dispatcher when button clicked', () => {
    const mockDispatch = vi.fn(() => Promise.resolve());
    render(
      <CtaSection
        {...sample}
        buttonAction={{ type: 'log', message: 'x' } as any}
        dispatcher={{ dispatch: mockDispatch } as any}
      />
    );
    const btn = screen.getByRole('button', { name: /Click me/ });
    fireEvent.click(btn);
    expect(mockDispatch).toHaveBeenCalled();
  });
});