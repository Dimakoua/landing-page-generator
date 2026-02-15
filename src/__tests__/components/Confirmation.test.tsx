import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Confirmation from '@/components/confirmation/Confirmation';

import type { Action } from '@/schemas/actions';

describe('Confirmation', () => {
  const mockDispatcher = {
    dispatch: vi.fn().mockResolvedValue({ success: true }),
  } as any;

  it('renders title and message', () => {
    render(
      <Confirmation
        title="Order Confirmed!"
        message="Thank you for your purchase."
        dispatcher={mockDispatcher}
      />
    );

    expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
    expect(screen.getByText('Thank you for your purchase.')).toBeInTheDocument();
  });

  it('renders default title and message when not provided', () => {
    render(<Confirmation dispatcher={mockDispatcher} />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Your action has been completed successfully.')).toBeInTheDocument();
  });

  it('renders button and dispatches action on click', () => {
    const mockAction: Action = { type: 'navigate', url: 'home' };
    const buttonProps = {
      label: 'Go Home',
      onClick: mockAction,
    };

    render(
      <Confirmation
        button={buttonProps}
        dispatcher={mockDispatcher}
      />
    );

    const button = screen.getByRole('button', { name: 'Go Home' });
    fireEvent.click(button);

    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(mockAction);
  });

  it('renders default button label when not provided', () => {
    const buttonProps = {
      onClick: { type: 'navigate', url: 'home' } as Action,
    };

    render(
      <Confirmation
        button={buttonProps}
        dispatcher={mockDispatcher}
      />
    );

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('does not render button when not provided', () => {
    render(<Confirmation dispatcher={mockDispatcher} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders user information when provided', () => {
    const userInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    render(
      <Confirmation
        userInfo={userInfo}
        dispatcher={mockDispatcher}
      />
    );

    expect(screen.getByText('Customer Information')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders order details when provided', () => {
    const orderItems = [
      {
        id: '1',
        name: 'Wireless Headphones',
        price: 99.99,
        quantity: 2,
        color: 'Black',
      },
      {
        id: '2',
        name: 'Phone Case',
        price: 29.99,
        quantity: 1,
      },
    ];
    const orderTotal = 229.97;

    render(
      <Confirmation
        orderItems={orderItems}
        orderTotal={orderTotal}
        dispatcher={mockDispatcher}
      />
    );

    expect(screen.getByText('Order Details')).toBeInTheDocument();
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Color: Black')).toBeInTheDocument();
    expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
    expect(screen.getByText('Phone Case')).toBeInTheDocument();
    expect(screen.getByText('$229.97')).toBeInTheDocument();
  });
});