import type { Meta, StoryObj } from '@storybook/react';
import SocialProof from './SocialProof';
import type { TestimonialItem } from './SocialProof';

const meta: Meta<typeof SocialProof> = {
  title: 'Components/SocialProof',
  component: SocialProof,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    heading: { control: 'text' },
    subheading: { control: 'text' },
    badgeText: { control: 'text' },
    testimonials: { control: 'object' },
    disclaimer: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleTestimonials: TestimonialItem[] = [
  {
    rating: 5,
    quote:
      "After two months on the gummies, I'm stronger than I've been in a decade. I'm back to my morning walks, gardening, and even started light weightlifting again!",
    name: 'Margaret K., 67',
    location: 'Minneapolis, MN',
    delay: 0,
  },
  {
    rating: 5,
    quote:
      "No more bloating or stomach issues like I had with powder! These gummies taste great and I actually look forward to taking them. My energy is through the roof!",
    name: 'Sarah L., 55',
    location: 'Austin, TX',
    delay: 0.1,
  },
  {
    rating: 5,
    quote:
      "At 62, I thought my best fitness days were behind me. The gummies proved me wrong. I'm lifting heavier and recovering faster than I did in my 50s. Game changer!",
    name: 'David R., 62',
    location: 'Phoenix, AZ',
    delay: 0.2,
  },
];

export const Default: Story = {
  args: {
    heading: 'Real People, Real Results',
    subheading:
      "Join thousands who've transformed their strength and vitality with our formula.",
    badgeText: '🏆 Recommended by Total Health & Fitness',
    testimonials: sampleTestimonials,
    disclaimer: 'Customer results have not been independently verified. Results may vary.',
  },
};
