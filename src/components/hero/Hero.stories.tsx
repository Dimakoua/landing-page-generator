import type { Meta, StoryObj } from '@storybook/react';
import Hero from './Hero';

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    description: { control: 'text' },
    backgroundImage: { control: 'text' },
    primaryButton: { control: 'object' },
    secondaryButton: { control: 'object' },
    badge: { control: 'text' },
    price: { control: 'text' },
    originalPrice: { control: 'text' },
    rating: { control: 'number', min: 0, max: 5 },
    reviewsCount: { control: 'number' },
    images: { control: 'object' },
    colors: { control: 'object' },
    quantity: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Classic: Story = {
  args: {
    title: 'Welcome to Our Platform',
    subtitle: 'Build amazing landing pages',
    description: 'Create stunning, high-converting landing pages with our easy-to-use builder.',
    backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=800&fit=crop',
    primaryButton: {
      label: 'Get Started',
      onClick: { type: 'navigate', url: '/signup' },
    },
    secondaryButton: {
      label: 'Learn More',
      onClick: { type: 'navigate', url: '/about' },
    },
  },
};

export const ECommerce: Story = {
  args: {
    badge: 'New Arrival',
    title: 'Premium Wireless Headphones',
    subtitle: 'Crystal clear sound with noise cancellation',
    description: 'Experience music like never before with our latest wireless headphones featuring active noise cancellation and 30-hour battery life.',
    price: '$299.99',
    originalPrice: '$399.99',
    rating: 4.5,
    reviewsCount: 128,
    images: [
      { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', alt: 'Headphones front view' },
      { src: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop', alt: 'Headphones side view' },
    ],
    colors: [
      { id: 'black', label: 'Black', color: '#000000' },
      { id: 'white', label: 'White', color: '#FFFFFF' },
      { id: 'blue', label: 'Blue', color: '#3B82F6' },
    ],
    quantity: 1,
    primaryButton: {
      label: 'Add to Cart',
      onClick: { type: 'cart', operation: 'add', productId: 'headphones-1' },
    },
  },
};