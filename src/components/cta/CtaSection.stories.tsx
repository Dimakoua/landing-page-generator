import type { Meta, StoryObj } from '@storybook/react';
import CtaSection from './CtaSection';
import type { CtaSectionProps } from './CtaSection';

const meta: Meta<typeof CtaSection> = {
  title: 'Components/CtaSection',
  component: CtaSection,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    heading: { control: 'text' },
    subheading: { control: 'text' },
    buttonLabel: { control: 'text' },
    guaranteeText: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sample: CtaSectionProps = {
  heading: 'Start Your Strength Journey Today',
  subheading:
    "Join thousands who've reclaimed their strength, energy, and independence. Your best self is waiting.",
  buttonLabel: 'Get Started Today',
  guaranteeText: '30-Day Money-Back Guarantee',
};

export const Default: Story = {
  args: sample,
};

export const WithAction: Story = {
  args: {
    ...sample,
    buttonAction: { type: 'log', message: 'clicked' } as any,
  },
};
