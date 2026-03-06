import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ProductShowcase from './ProductShowcase';
import type { ProductShowcaseProps } from './ProductShowcase';

const meta: Meta<typeof ProductShowcase> = {
  title: 'Components/ProductShowcase',
  component: ProductShowcase,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    rating: { control: 'number' },
    reviews: { control: 'number' },
    ordersInfo: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
    galleryImages: { control: 'object' },
    priceOptions: { control: 'object' },
    primaryAction: { control: 'object' },
    shippingInfo: { control: 'text' },
    paymentMethods: { control: 'object' },
    features: { control: 'object' },
    accordionItems: { control: 'object' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleImages = [
  // using picsum.photos for simple stock images
  { src: 'https://picsum.photos/seed/main/600/600', alt: 'Product main' },
  { src: 'https://picsum.photos/seed/thumb1/150/150', alt: 'Thumb1' },
  { src: 'https://picsum.photos/seed/thumb2/150/150', alt: 'Thumb2' },
];

const sampleOptions = [
  { id: 'opt1', title: '3 Bottles + 1 Free', subtitle: '$22.49/Bottle', price: '$89.97', badgeText: 'Best Value', note: 'Limited Quantities' },
  { id: 'opt2', title: '1 Bottle', price: '$29.99' },
];

const sampleFeatures = [
  { icon: <span className="material-icons text-primary">shield_check</span>, text: '30-Day Money Back' },
  { icon: <span className="material-icons text-primary">package</span>, text: 'Free Shipping' },
];

const sampleAccordion = [
  { title: 'Benefits', content: 'Build strength, boost energy, and feel amazing.' },
  { title: 'How to Use', content: 'Take one gummy daily with water.' },
];

export const Default: Story = {
  args: {
    rating: 4.8,
    reviews: 847,
    ordersInfo: '⭐ 4.8/5 Rating from 847 Reviews',
    title: 'Premium Creatine Gummies',
    description: 'Build strength, boost energy, and feel amazing—without the bloat or bulk',
    galleryImages: sampleImages,
    priceOptions: sampleOptions,
    primaryAction: { label: 'Buy Now - $89.97' },
    shippingInfo: 'Ships by Friday, Mar 6',
    paymentMethods: ['VISA', 'Mastercard', 'Apple Pay', 'Shop Pay'],
    features: sampleFeatures,
    accordionItems: sampleAccordion,
  },
};

export const Minimal: Story = {
  args: {
    title: 'Simple Product',
    description: 'Just a short description',
    primaryAction: { label: 'Learn More' },
  },
};
