import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from '@/components/navigation/Navigation';

describe('Navigation (design parity)', () => {
  it('renders logo, center links and cart badge', () => {
    render(
      <Navigation
        logo={{ text: 'SonicFlow' }}
        menuItems={[
          { label: 'Overview', action: { type: 'navigate', url: 'home' } },
          { label: 'Specs', action: { type: 'navigate', url: 'specs' } },
          { label: 'Reviews', action: { type: 'navigate', url: 'reviews' } },
        ]}
        cartIcon={{ itemCount: 2, action: { type: 'navigate', url: 'cart' } }}
      />
    );

    // Logo rendered (combined string or split - assert presence of combined text)
    expect(screen.getByText(/SonicFlow/i)).toBeInTheDocument();

    // center links
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Specs')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();

    // material icon for cart exists and badge shows count
    expect(screen.getByText('shopping_bag')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('dispatches menu and cart actions when clicked', () => {
    // ensure dispatch returns a Promise so .catch() is safe in component
    const mockDispatch = vi.fn(() => Promise.resolve());
    render(
      <Navigation
        logo={{ text: 'SonicFlow' }}
        menuItems={[{ label: 'Specs', action: { type: 'navigate', url: 'specs' } }]}
        cartIcon={{ itemCount: 1, action: { type: 'navigate', url: 'cart' } }}
        dispatcher={{ dispatch: mockDispatch } as any}
      />
    );

    fireEvent.click(screen.getByText('Specs'));
    expect(mockDispatch).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Cart'));
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('scrolls to anchor when menu link is an in-page fragment', () => {
    // create an element with id "specs" to scroll to
    const target = document.createElement('div');
    target.id = 'specs';
    document.body.appendChild(target);

    const scrollSpy = vi.fn();
    // mock scrollIntoView on the element
    (target as any).scrollIntoView = scrollSpy;

    render(
      <Navigation
        logo={{ text: 'SonicFlow' }}
        menuItems={[{ label: 'Specs', action: { type: 'navigate', url: '#specs' } }]}
      />
    );

    fireEvent.click(screen.getByText('Specs'));
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    // cleanup
    document.body.removeChild(target);
  });
});
