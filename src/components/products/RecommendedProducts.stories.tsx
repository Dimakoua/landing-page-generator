import type { Meta, StoryObj } from '@storybook/react';
import RecommendedProducts from './RecommendedProducts';

const meta: Meta<typeof RecommendedProducts> = {
  title: 'Components/RecommendedProducts',
  component: RecommendedProducts,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text' },
    products: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleProducts = [
  {
    id: '1',
    title: 'Wireless Charging Pad',
    price: '$29.99',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop',
    cta: {
      label: 'Add to Cart',
      onClick: { type: 'cart', operation: 'add', productId: 'charger-1' },
    },
  },
  {
    id: '2',
    title: 'Protective Case',
    price: '$19.99',
    image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=300&h=300&fit=crop',
    cta: {
      label: 'Add to Cart',
      onClick: { type: 'cart', operation: 'add', productId: 'case-1' },
    },
  },
  {
    id: '3',
    title: 'Extra Battery Pack',
    price: '$49.99',
    image: 'https://images.unsplash.com/photo-1609592806580-d4b3c6e1c7b5?w=300&h=300&fit=crop',
    cta: {
      label: 'Add to Cart',
      onClick: { type: 'cart', operation: 'add', productId: 'battery-1' },
    },
  },
  {
    id: '4',
    title: 'Screen Protector',
    price: '$14.99',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
    cta: {
      label: 'Add to Cart',
      onClick: { type: 'cart', operation: 'add', productId: 'protector-1' },
    },
  },
];

export const Default: Story = {
  args: {
    title: 'Complete Your Setup',
    products: sampleProducts,
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'You Might Also Like',
    products: sampleProducts.slice(0, 3),
  },
};

export const SingleProduct: Story = {
  args: {
    title: 'Recommended for You',
    products: [sampleProducts[0]],
  },
};