import type { Meta, StoryObj } from '@storybook/react';
import Navbar from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    logo: { control: 'object' },
    menuItems: { control: 'object' },
    cta: { control: 'object' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logo: {
      text: 'BrandName',
      href: '/',
    },
    menuItems: [
      { label: 'Benefits', href: '#benefits' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'FAQs', href: '#faq' },
    ],
    cta: { label: 'Shop Now', href: '/shop' },
  },
};

export const WithImageLogo: Story = {
  args: {
    logo: {
      image: 'https://via.placeholder.com/150x50?text=Logo',
      alt: 'Placeholder logo',
      href: '/',
    },
    menuItems: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
    ],
    cta: { label: 'Buy', href: '/buy' },
  },
};

export const DispatchActions: Story = {
  args: {
    logo: {
      text: 'Act',
      onClick: { type: 'navigate', url: '/home' },
    },
    menuItems: [
      { label: 'One', action: { type: 'navigate', url: '/one' } },
      { label: 'Two', action: { type: 'navigate', url: '/two' } },
    ],
    cta: { label: 'Action', action: { type: 'navigate', url: '/action' } },
    actions: { toggleMenu: { type: 'log', message: 'toggled' } },
  },
};
