import type { Meta, StoryObj } from '@storybook/react';
import Accordion from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    items: { control: 'object' },
    allowMultiple: { control: 'boolean' },
    defaultOpen: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  {
    id: 'item1',
    title: 'What is this product?',
    content: 'This is a high-quality product designed to meet your needs with premium features and excellent performance.',
  },
  {
    id: 'item2',
    title: 'How does it work?',
    content: [
      { label: 'Step 1', value: 'Initialize the system' },
      { label: 'Step 2', value: 'Configure your settings' },
      { label: 'Step 3', value: 'Start using the product' },
    ],
  },
  {
    id: 'item3',
    title: 'Pricing Information',
    content: 'Contact our sales team for detailed pricing information tailored to your specific requirements.',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    allowMultiple: false,
  },
};

export const MultipleOpen: Story = {
  args: {
    items: sampleItems,
    allowMultiple: true,
    defaultOpen: ['item1', 'item2'],
  },
};

export const SingleItem: Story = {
  args: {
    items: [sampleItems[0]],
  },
};