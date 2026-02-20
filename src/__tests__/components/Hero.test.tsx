import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Hero from '@/components/hero/Hero';

import type { Action } from '@/schemas/actions';

describe('Hero Component', () => {
  // helper that wraps render in act to avoid warning
  const safeRender = (ui: React.ReactElement) => {
    let result: ReturnType<typeof render>;
    act(() => {
      result = render(ui);
    });
    return result!;
  }
  const mockDispatcher = {
    dispatch: vi.fn().mockResolvedValue({ success: true }),
  } as any;

  beforeEach(() => {
    mockDispatcher.dispatch.mockClear();
  });

  describe('Product-style Hero (with images)', () => {
    const productProps = {
      title: 'Test Product',
      description: 'A great product',
      price: 99.99,
      originalPrice: 129.99,
      rating: 4.5,
      reviewsCount: 42,
      images: [
        { src: 'img1.jpg', alt: 'Image 1' },
        { src: 'img2.jpg', alt: 'Image 2' },
      ],
      colors: [
        { id: 'blue', label: 'Midnight Blue', color: '#135bec' },
        { id: 'black', label: 'Charcoal', color: '#0f172a' },
      ],
      quantity: 2,
      dispatcher: mockDispatcher,
    };

    it('renders product information correctly', () => {
      safeRender(<Hero {...productProps} />);

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('A great product')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('$129.99')).toBeInTheDocument();
      expect(screen.getByText('42 Reviews')).toBeInTheDocument();
    });

    it('renders color options from props and updates selected color', () => {
      safeRender(<Hero {...productProps} />);

      // label shows the initially selected color (first in list)
      expect(screen.getByText(/Midnight Blue/i)).toBeInTheDocument();

      // find the button for the second color and click
      const colorButtons = screen.getAllByRole('button', { name: /Midnight Blue|Charcoal/ });
      fireEvent.click(colorButtons[1]);

      // label should update to Charcoal
      expect(screen.getByText(/Charcoal/i)).toBeInTheDocument();
    });

    it('handles image gallery navigation', () => {
      safeRender(<Hero {...productProps} />);

      const mainImage = screen.getByAltText('Main Image 1');
      expect(mainImage).toBeInTheDocument();

      // Click on second thumbnail
      const thumbnails = screen.getAllByAltText(/Thumbnail/);
      expect(thumbnails).toHaveLength(2); // 2 thumbnails

      fireEvent.click(thumbnails[1]); // second thumbnail

      // Main image should change
      expect(screen.getByAltText('Main Image 2')).toBeInTheDocument();
    });

    it('handles quantity controls', () => {
      safeRender(<Hero {...productProps} />);

      const decreaseBtn = screen.getByLabelText('Decrease quantity');
      const increaseBtn = screen.getByLabelText('Increase quantity');
      const quantityDisplay = screen.getByText('2');

      expect(quantityDisplay).toBeInTheDocument();

      fireEvent.click(increaseBtn);
      expect(screen.getByText('3')).toBeInTheDocument();

      fireEvent.click(decreaseBtn);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('dispatches cart action with quantity and color on button click', () => {
      const cartAction: Action = { type: 'cart', operation: 'add' };
      safeRender(<Hero {...productProps} primaryButton={{ label: 'Add to Cart', onClick: cartAction }} />);

      const addButton = screen.getByRole('button', { name: 'Add to Cart' });
      fireEvent.click(addButton);

      expect(mockDispatcher.dispatch).toHaveBeenCalledWith({
        ...cartAction,
        quantity: 2,
        color: 'blue',
      });
    });

    it('injects selected quantity/color into cart action inside a chain', () => {
      const chainAction: Action = {
        type: 'chain',
        actions: [
          {
            type: 'cart',
            operation: 'add',
            item: {
              id: 'sonicflow-pro-x',
              name: 'SonicFlow Pro X',
              description: 'Premium',
              price: 299,
              image: 'img.jpg',
              quantity: 1,
            },
          },
          { type: 'navigate', url: 'cart' },
        ],
      };

      safeRender(<Hero {...productProps} primaryButton={{ label: 'Add to Cart', onClick: chainAction }} />);

      const addButton = screen.getByRole('button', { name: 'Add to Cart' });
      fireEvent.click(addButton);

      expect(mockDispatcher.dispatch).toHaveBeenCalledWith({
        type: 'chain',
        actions: [
          {
            type: 'cart',
            operation: 'add',
            item: {
              id: 'sonicflow-pro-x',
              name: 'SonicFlow Pro X',
              description: 'Premium',
              price: 299,
              image: 'img.jpg',
              quantity: 2, // updated
              color: 'blue',
            },
            quantity: 2,
            color: 'blue',
          },
          { type: 'navigate', url: 'cart' },
        ],
      });
    });

    it('dispatches non-cart actions directly', () => {
      const navigateAction: Action = { type: 'navigate', url: '/checkout' };
      safeRender(<Hero {...productProps} primaryButton={{ label: 'Buy Now', onClick: navigateAction }} />);

      const buyButton = screen.getByRole('button', { name: 'Buy Now' });
      fireEvent.click(buyButton);

      expect(mockDispatcher.dispatch).toHaveBeenCalledWith(navigateAction);
    });

    it('renders rating stars correctly', () => {
      safeRender(<Hero {...productProps} />);

      // Should have star icons (material icons)
      const stars = screen.getAllByTestId('star-rating');
      expect(stars.length).toBeGreaterThan(0);
    });

    it('renders badge when provided', () => {
      safeRender(<Hero {...productProps} badge="New" />);

      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  describe('Classic Hero (without images)', () => {
    const classicProps = {
      title: 'Welcome',
      subtitle: 'Welcome to our platform',
      description: 'Start your journey today',
      backgroundImage: 'bg.jpg',
      primaryButton: { label: 'Get Started', onClick: { type: 'navigate' as const, url: '/signup' } },
      secondaryButton: { label: 'Learn More', onClick: { type: 'navigate' as const, url: '/about' } },
      dispatcher: mockDispatcher,
    };

    it('renders classic hero layout', () => {
      safeRender(<Hero {...classicProps} />);

      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Welcome to our platform')).toBeInTheDocument();
      expect(screen.getByText('Start your journey today')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
    });

    it('applies background image style', () => {
      safeRender(<Hero {...classicProps} />);

      const heroSection = screen.getByRole('main') || screen.getByTestId('hero-section');
      expect(heroSection).toHaveStyle({ backgroundImage: 'url(bg.jpg)' });
    });

    it('dispatches primary button action', () => {
      safeRender(<Hero {...classicProps} />);

      const primaryBtn = screen.getByRole('button', { name: 'Get Started' });
      fireEvent.click(primaryBtn);

      expect(mockDispatcher.dispatch).toHaveBeenCalledWith(classicProps.primaryButton.onClick);
    });

    it('dispatches secondary button action', () => {
      safeRender(<Hero {...classicProps} />);

      const secondaryBtn = screen.getByRole('button', { name: 'Learn More' });
      fireEvent.click(secondaryBtn);

      expect(mockDispatcher.dispatch).toHaveBeenCalledWith(classicProps.secondaryButton.onClick);
    });
  });

  describe('Edge cases', () => {
    it('handles missing props gracefully', () => {
      safeRender(<Hero />);

      // Should not crash with minimal props
      expect(screen.getByRole('main') || document.querySelector('.relative')).toBeInTheDocument();
    });

    it('handles empty images array', () => {
      safeRender(<Hero images={[]} />);

      // Should render classic hero when images is empty
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('handles missing dispatcher', () => {
      const props = {
        title: 'Test',
        images: [{ src: 'test.jpg' }],
        primaryButton: { label: 'Click', onClick: { type: 'navigate', url: '/' } as Action },
      };

      safeRender(<Hero {...props} />);

      const button = screen.getByRole('button', { name: 'Click' });
      fireEvent.click(button);

      // Should not crash, just not dispatch
      expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });
  });
});