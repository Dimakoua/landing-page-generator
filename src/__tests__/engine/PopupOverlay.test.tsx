import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PopupOverlay from '@/engine/PopupOverlay';

const mockLayouts = { desktop: { sections: [] }, mobile: { sections: [] } };

describe('PopupOverlay', () => {
  it('renders and calls closePopup when close button clicked', () => {
    const close = vi.fn();
    render(<PopupOverlay popupStepId="cart" popupLayouts={mockLayouts as any} slug="test" variant="A" navigate={() => {}} closePopup={close} />);

    const btn = screen.getByLabelText('Close popup');
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(close).toHaveBeenCalled();
  });

  it('renders nothing when no popupStepId provided', () => {
    const { container } = render(<PopupOverlay popupStepId={null} popupLayouts={null} slug="test" variant="A" navigate={() => {}} closePopup={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});