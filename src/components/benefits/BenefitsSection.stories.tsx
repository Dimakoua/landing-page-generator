import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import BenefitsSection from './BenefitsSection';
import type {
  BenefitItem,
  BundleItem,
  ScienceBlock,
  FAQItem,
} from './BenefitsSection';

const meta: Meta<typeof BenefitsSection> = {
  title: 'Components/BenefitsSection',
  component: BenefitsSection,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    heading: { control: 'text' },
    subheading: { control: 'text' },
    benefits: { control: 'object' },
    bundles: { control: 'object' },
    science: { control: 'object' },
    faqs: { control: 'object' },
    cta: { control: 'object' },
    backgroundImage: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleBenefits: BenefitItem[] = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-dumbbell w-8 h-8 text-primary"
      >
        <path d="M14.4 14.4 9.6 9.6"></path>
        <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"></path>
        <path d="m21.5 21.5-1.4-1.4"></path>
        <path d="M3.9 3.9 2.5 2.5"></path>
        <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"></path>
      </svg>
    ),
    title: 'Lean Strength Gains',
    description: 'Supports toned muscle development without excess weight',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-zap w-8 h-8 text-primary"
      >
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
      </svg>
    ),
    title: 'Sustained Energy',
    description: 'Helps keep you alert and active from morning to evening',
  },
  // add remaining items similarly or simplify for story
];

const sampleBundles: BundleItem[] = [
  {
    // using picsum.photos for free placeholder
    imageSrc: 'https://picsum.photos/seed/gympack/600/400',
    title: 'Starter Elite Bundle',
    subtitle: 'Essential mix for new users',
    includes: ['Key Ingredient A', 'Key Ingredient B'],
    description:
      'Ideal for newcomers, this bundle combines foundational support with calming adaptogens to ease your transition into a supplement routine.',
    price: '$39.99',
    originalPrice: '$53.98',
    saveText: 'Save 26%',
    ctaLabel: 'Get This Bundle',
  },
  {
    imageSrc: 'https://picsum.photos/seed/peakperform/600/400',
    title: 'Advanced Recovery Pack',
    subtitle: 'Optimize training & rest',
    includes: ['Ingredient X', 'Ingredient Y', 'Ingredient Z'],
    description:
      'Designed for experienced users, this selection targets recovery, endurance, and nightly restoration—all in one convenient set.',
    price: '$59.95',
    originalPrice: '$77.97',
    saveText: 'Save 23%',
    badge: 'Most Popular',
    ctaLabel: 'Get This Bundle',
  },
];

const sampleScience: ScienceBlock = {
  headline: 'The Science-Backed Powerhouse',
  copy: 'With over 500 scientific studies spanning three decades, creatine is the most researched supplement in the world. The results are clear: it works, it’s safe, and it delivers real results for people of all ages.',
  boxCopy:
    'Just 5.25 grams per day (3 delicious gummies) is all you need to experience the full benefits. Simple, effective, life-changing.',
};

const sampleFaqs: FAQItem[] = [
  {
    question: 'Will I get bulky?',
    answer: "No! Creatine builds lean, toned muscle—not bulk. You'll get strength and definition without gaining size.",
  },
  {
    question: 'Will I bloat?',
    answer: "Not with our clean formula! Traditional powders often cause bloating, but these gummies are gentle on your stomach and designed to prevent water retention.",
  },
  {
    question: 'Is it safe for everyone?',
    answer: "Absolutely! Over 500 studies confirm creatine is safe for everyone. It's especially beneficial for people 50+ experiencing age-related muscle loss.",
  },
];

export const Default: Story = {
  args: {
    heading: 'Discover the Edge with Our Supplement',
    subheading:
      "Packed with research-backed ingredients, this formula helps support daily performance and recovery so you can stay active on your terms.",
    benefits: sampleBenefits,
    bundles: sampleBundles,
    science: sampleScience,
    faqs: sampleFaqs,
    cta: { label: 'Ready to Experience These Benefits?' },
    backgroundImage: '/assets/research-background-YijLE3SQ.jpg',
  },
};
