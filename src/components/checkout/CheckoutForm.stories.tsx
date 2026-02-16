import type { Meta, StoryObj } from '@storybook/react';
import CheckoutForm from './CheckoutForm';

const meta: Meta<typeof CheckoutForm> = {
  title: 'Components/CheckoutForm',
  component: CheckoutForm,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    form: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleForm = {
  id: 'checkout',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your first name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Enter your last name',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      validator: 'email',
      placeholder: 'Enter your email',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      mask: 'phone',
      placeholder: '(555) 123-4567',
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      required: true,
      placeholder: 'Enter your address',
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      required: true,
      placeholder: 'Enter your city',
    },
    {
      name: 'zipCode',
      label: 'ZIP Code',
      type: 'text',
      required: true,
      validator: 'zipCode',
      placeholder: '12345',
    },
  ],
  submitButton: {
    label: 'Complete Purchase',
    onClick: { type: 'navigate', url: '/confirmation' },
  },
};

export const Default: Story = {
  args: {
    title: 'Checkout',
    form: sampleForm,
  },
};

export const WithValidation: Story = {
  args: {
    title: 'Secure Checkout',
    form: sampleForm,
  },
};