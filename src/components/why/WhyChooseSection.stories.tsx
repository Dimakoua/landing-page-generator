import type { Meta, StoryObj } from '@storybook/react';
import WhyChooseSection from './WhyChooseSection';
import type { BadgeItem, GuaranteeBlock, Testimonial } from './WhyChooseSection';

const meta: Meta<typeof WhyChooseSection> = {
  title: 'Components/WhyChooseSection',
  component: WhyChooseSection,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    heading: { control: 'text' },
    subheading: { control: 'text' },
    badges: { control: 'object' },
    badgeButtonText: { control: 'text' },
    guarantee: { control: 'object' },
    testimonial: { control: 'object' },
    ctaLabel: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleBadges: BadgeItem[] = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-award w-7 h-7 text-primary"
      >
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
        <circle cx="12" cy="8" r="6" />
      </svg>
    ),
    title: 'Formulated for Real People',
    description:
      'Every batch is engineered to minimize digestive stress while maximizing performance benefits.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-leaf w-7 h-7 text-primary"
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
    title: 'Transparent Labeling',
    description:
      'No hidden fillers or additives—what you see is what you get, straight from the ingredient list.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-shield w-7 h-7 text-primary"
      >
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      </svg>
    ),
    title: 'Scientifically Tuned Dose',
    description:
      'An evidence-based serving size proven to support strength gains without unnecessary extras.',
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-dollar-sign w-7 h-7 text-primary"
      >
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Affordable Excellence',
    description:
      'Top-tier ingredients priced for daily use—because consistency matters more than catchphrases.',
  },
];

const sampleGuarantee: GuaranteeBlock = {
  logoSrc: 'https://picsum.photos/seed/logo/80/80',
  points: [
    { headline: 'Quality First', text: 'Every batch is third-party tested for purity and potency.' },
    { headline: 'Results or Refund', text: '30-day money-back guarantee.' },
    { headline: 'Natural Ingredients', text: 'Made in GMP-certified US facilities.' },
  ],
};

const sampleTestimonial: Testimonial = {
  quote:
    "I've tried dozens of creatine products over the years. This is the only one I confidently recommend to my clients. The quality, the convenience, and the results speak for themselves.",
  author: 'Wes Barney, Total Health & Fitness',
};

export const Default: Story = {
  args: {
    heading: 'What Makes This Formula Different',
    subheading:
      'Designed for users who expect more than just promises. This product delivers clean, effective support without the downsides of typical powders.',
    badgeButtonText: '🔒 Trusted by Serious Athletes',
    badges: sampleBadges,
    guarantee: sampleGuarantee,
    testimonial: sampleTestimonial,
    ctaLabel: 'Experience the Difference',
  },
};
