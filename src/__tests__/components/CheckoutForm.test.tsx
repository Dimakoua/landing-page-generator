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

  it('validates fields with validators and shows errors', () => {
    mockDispatcher.dispatch.mockClear();

    const formWithValidators = {
      id: 'checkout-form',
      fields: [
        { name: 'cardNumber', label: 'Card Number', type: 'text', required: true, validator: 'cardNumber', mask: 'cardNumber', placeholder: '1234 5678 9012 3456' },
        { name: 'cvv', label: 'CVV', type: 'text', required: true, validator: 'cvv', mask: 'cvv', placeholder: '123' },
      ],
      submitButton: {
        label: 'Pay Now',
        onClick: { type: 'navigate', url: 'success' },
      },
    };

    render(<CheckoutForm form={formWithValidators} dispatcher={mockDispatcher} />);

    const cardInput = screen.getByRole('textbox', { name: /card number/i });
    const cvvInput = screen.getByRole('textbox', { name: /cvv/i });

    // Enter invalid values
    fireEvent.change(cardInput, { target: { value: '123' } });
    fireEvent.change(cvvInput, { target: { value: '12' } });

    const submitButton = screen.getByRole('button', { name: 'Pay Now' });
    fireEvent.click(submitButton);

    // Check that errors are shown
    expect(screen.getByText('Card number must be 13-19 digits')).toBeInTheDocument();
    expect(screen.getByText('CVV must be 3 or 4 digits')).toBeInTheDocument();

    // Navigate action should not be called
    expect(mockDispatcher.dispatch).not.toHaveBeenCalledWith({ type: 'navigate', url: 'success' });
  });

  it('marks required fields with asterisk', () => {
    render(<CheckoutForm form={mockForm} dispatcher={mockDispatcher} />);

    const asterisks = screen.getAllByText('*');
    expect(asterisks).toHaveLength(3); // 3 required fields
  });
});