import type { Meta, StoryObj } from '@storybook/react';
import Footer from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    logo: { control: 'object' },
    newsletter: { control: 'object' },
    links: { control: 'object' },
    copyright: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleLinks = [
  { label: 'About', onClick: { type: 'navigate', url: '/about' } },
  { label: 'Contact', onClick: { type: 'navigate', url: '/contact' } },
  { label: 'Privacy Policy', onClick: { type: 'navigate', url: '/privacy' } },
  { label: 'Terms of Service', onClick: { type: 'navigate', url: '/terms' } },
];

export const Default: Story = {
  args: {
    logo: {
      text: 'MyBrand',
    },
    newsletter: {
      title: 'Stay Updated',
      description: 'Subscribe to our newsletter for the latest updates and offers.',
      placeholder: 'Enter your email',
      submitButton: {
        label: 'Subscribe',
        onClick: { type: 'analytics', event: 'newsletter_signup' },
      },
    },
    links: sampleLinks,
    copyright: '© 2024 MyBrand. All rights reserved.',
  },
};

export const WithImageLogo: Story = {
  args: {
    logo: {
      image: 'https://via.placeholder.com/150x50?text=Logo',
    },
    newsletter: {
      title: 'Join Our Community',
      description: 'Get exclusive content and early access to new features.',
      placeholder: 'your@email.com',
      submitButton: {
        label: 'Join Now',
        onClick: { type: 'analytics', event: 'newsletter_signup' },
      },
    },
    links: sampleLinks,
    copyright: '© 2024 MyBrand. All rights reserved.',
  },
};

export const Minimal: Story = {
  args: {
    links: sampleLinks,
    copyright: '© 2024 MyBrand. All rights reserved.',
  },
};