import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutForm from '@/components/checkout/CheckoutForm';

describe('CheckoutForm', () => {
  const mockForm = {
    id: 'checkout-form',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'firstName', label: 'First Name', type: 'text', required: true },
      { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    ],
    submitButton: {
      label: 'Pay Now',
    },
  };

  const mockDispatcher = {
    dispatch: vi.fn().mockResolvedValue({ success: true }),
  };

  it('renders form fields and submit button', () => {
    render(<CheckoutForm form={mockForm} dispatcher={mockDispatcher} />);

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pay Now' })).toBeInTheDocument();
  });

  it('updates form data on input change', () => {
    render(<CheckoutForm form={mockForm} dispatcher={mockDispatcher} />);

    const inputs = screen.getAllByDisplayValue('');
    const emailInput = inputs.find(input => input.getAttribute('name') === 'email') as HTMLInputElement;
    const firstNameInput = inputs.find(input => input.getAttribute('name') === 'firstName') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(firstNameInput).toHaveValue('John');
  });

  it('dispatches submit action on form submission', () => {
    const mockAction = { type: 'navigate', url: 'success' };
    const formWithAction = {
      ...mockForm,
      submitButton: {
        ...mockForm.submitButton,
        onClick: mockAction,
      },
    };

    render(<CheckoutForm form={formWithAction} dispatcher={mockDispatcher} />);

    // Fill in required fields to avoid validation
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });

    const submitButton = screen.getByRole('button', { name: 'Pay Now' });
    fireEvent.click(submitButton);

    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(mockAction);
  });

  it('marks required fields with asterisk', () => {
    render(<CheckoutForm form={mockForm} dispatcher={mockDispatcher} />);

    const asterisks = screen.getAllByText('*');
    expect(asterisks).toHaveLength(3); // 3 required fields
  });
});