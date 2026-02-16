import type { Meta, StoryObj } from '@storybook/react';
import Navigation from './Navigation';

const meta: Meta<typeof Navigation> = {
  title: 'Components/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    logo: { control: 'object' },
    menuItems: { control: 'object' },
    cartIcon: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logo: {
      text: 'MyBrand',
      onClick: { type: 'navigate', url: '/' },
    },
    menuItems: [
      { label: 'Home', action: { type: 'navigate', url: '/' } },
      { label: 'Products', action: { type: 'navigate', url: '/products' } },
      { label: 'About', action: { type: 'navigate', url: '/about' } },
      { label: 'Contact', action: { type: 'navigate', url: '/contact' } },
    ],
    cartIcon: {
      itemCount: 3,
      action: { type: 'navigate', url: '/cart' },
    },
  },
};

export const WithImageLogo: Story = {
  args: {
    logo: {
      image: 'https://via.placeholder.com/150x50?text=Logo',
      onClick: { type: 'navigate', url: '/' },
    },
    menuItems: [
      { label: 'Home', action: { type: 'navigate', url: '/' } },
      { label: 'Services', action: { type: 'navigate', url: '/services' } },
      { label: 'Portfolio', action: { type: 'navigate', url: '/portfolio' } },
    ],
  },
};