import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecommendedProducts from '@/components/products/RecommendedProducts';
import type { RecProduct } from '@/components/products/RecommendedProducts';
import type { Action } from '@/schemas/actions';

describe('RecommendedProducts', () => {
  it('renders product cards and buttons', () => {
    const products: RecProduct[] = [
      { id: 'p1', title: 'Walnut Stand', price: '$40.00', image: 'img1.jpg', cta: { label: 'Add to Order' } },
      { id: 'p2', title: 'Travel Case', price: '$25.00', image: 'img2.jpg', cta: { label: 'Add to Order' } },
    ];

    render(<RecommendedProducts products={products} title="Complete Your Setup" />);

    expect(screen.getByText('Complete Your Setup')).toBeInTheDocument();
    expect(screen.getByText('Walnut Stand')).toBeInTheDocument();
    expect(screen.getByText('$40.00')).toBeInTheDocument();
    expect(screen.getAllByText('Add to Order').length).toBeGreaterThan(0);
  });

  it('dispatches action when CTA clicked', () => {
    const mockDispatch = vi.fn().mockResolvedValue({ success: true });
    const products: RecProduct[] = [
      { id: 'p1', title: 'Walnut Stand', price: 40, image: 'img1.jpg', cta: { label: 'Add to Order', onClick: { type: 'log', message: 'added' } as Action } },
    ];

    render(<RecommendedProducts products={products} dispatcher={{ dispatch: mockDispatch } as any} />);

    fireEvent.click(screen.getByText('Add to Order'));
    expect(mockDispatch).toHaveBeenCalled();
  });
});