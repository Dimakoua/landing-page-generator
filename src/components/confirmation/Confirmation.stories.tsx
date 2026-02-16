import type { Meta, StoryObj } from '@storybook/react';
import Confirmation from './Confirmation';

const meta: Meta<typeof Confirmation> = {
  title: 'Components/Confirmation',
  component: Confirmation,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
    userInfo: { control: 'object' },
    orderItems: { control: 'object' },
    orderTotal: { control: 'number' },
    button: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOrderItems = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 299.99,
    quantity: 1,
    color: 'Black',
  },
  {
    id: '2',
    name: 'Charging Cable',
    price: 19.99,
    quantity: 2,
  },
];

export const Success: Story = {
  args: {
    title: 'Order Confirmed!',
    message: 'Thank you for your purchase. Your order has been successfully placed.',
    userInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    orderItems: sampleOrderItems,
    orderTotal: 339.97,
    button: {
      label: 'Continue Shopping',
      onClick: { type: 'navigate', url: '/products' },
    },
  },
};

export const Simple: Story = {
  args: {
    title: 'Success!',
    message: 'Your action has been completed successfully.',
    button: {
      label: 'Go Home',
      onClick: { type: 'navigate', url: '/' },
    },
  },
};