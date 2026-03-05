import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Navbar from '@/components/navbar/Navbar';

describe('Navbar (new design)', () => {
  const safeRender = (ui: React.ReactElement) => {
    let result: ReturnType<typeof render>;
    act(() => {
      result = render(ui);
    });
    return result!;
  };

  it('renders logo text, links and CTA', () => {
    safeRender(
      <Navbar
        logo={{ text: 'MyBrand', href: '/' }}
        menuItems={[
          { label: 'Benefits', href: '#benefits' },
          { label: 'How It Works', href: '#how-it-works' },
        ]}
        cta={{ label: 'Shop Now', href: '/shop' }}
      />
    );

    expect(screen.getByText('MyBrand')).toBeInTheDocument();
    expect(screen.getByText('Benefits')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
  });

  it('dispatches actions for menu items and cta when provided', () => {
    const mockDispatch = vi.fn(() => Promise.resolve());
    safeRender(
      <Navbar
        logo={{ text: 'Act' }}
        menuItems={[{ label: 'Stuff', action: { type: 'navigate', url: '/stuff' } }]}
        cta={{ label: 'Go', action: { type: 'navigate', url: '/go' } }}
        dispatcher={{ dispatch: mockDispatch } as any}
      />
    );
    fireEvent.click(screen.getByText('Stuff'));
    fireEvent.click(screen.getByText('Go'));
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('dispatches toggleMenu action when burger clicked', () => {
    const mockDispatch = vi.fn(() => Promise.resolve());
    safeRender(
      <Navbar
        logo={{ text: 'Logo' }}
        dispatcher={{ dispatch: mockDispatch } as any}
        actions={{ toggleMenu: { type: 'log', message: 'x' } }}
      />
    );
    const button = screen.getByLabelText('Toggle menu');
    fireEvent.click(button);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
