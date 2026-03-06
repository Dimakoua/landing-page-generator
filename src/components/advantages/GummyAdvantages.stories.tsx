import type { Meta, StoryObj } from '@storybook/react';
import GummyAdvantages from './GummyAdvantages';
import type {
  GridFeature,
  ComparisonRow,
  CalloutBlock,
  ImageBlock,
} from './GummyAdvantages';

const meta: Meta<typeof GummyAdvantages> = {
  title: 'Components/GummyAdvantages',
  component: GummyAdvantages,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    heading: { control: 'text' },
    subheading: { control: 'text' },
    features: { control: 'object' },
    image: { control: 'object' },
    comparisons: { control: 'object' },
    callout: { control: 'object' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const sampleFeatures: GridFeature[] = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        className="lucide lucide-smile w-6 h-6 text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" x2="9.01" y1="9" y2="9"></line>
        <line x1="15" x2="15.01" y1="9" y2="9"></line>
      </svg>
    ),
    title: 'Tastes Great',
    description: "No chalky, bitter flavors—just real fruit gummies you'll want to take.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        className="lucide lucide-zap w-6 h-6 text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
      </svg>
    ),
    title: 'Gentle on Stomach',
    description: "Designed for sensitive systems—no bloating or discomfort.",
  },
];

const sampleComparisons: ComparisonRow[] = [
  {
    feature: 'Ease of Use',
    ours: { icon: <span>✔️</span>, text: 'Pop & go' },
    theirs: { icon: <span>❌</span>, text: 'Mix & shake' },
  },
  {
    feature: 'Dosing Accuracy',
    ours: { icon: <span>✔️</span>, text: 'Pre-measured' },
    theirs: { icon: <span>❌</span>, text: 'Scoop-based' },
  },
];

const sampleImage: ImageBlock = {
  src: 'https://picsum.photos/seed/benefits/800/500',
  alt: 'Person holding gummies',
  ctaLabel: 'Order Now',
};

const sampleCallout: CalloutBlock = {
  headline: "Effortless Wellness",
  copy: 'Take your gummies anytime, anywhere—no water or prep needed.',
  highlight: 'Wellness should fit your life, not the other way around.',
};

export const Default: Story = {
  args: {
    heading: 'Why Gummies Are the Smart Choice',
    subheading:
      'Easy, tasty, and precise—gummies deliver all the benefits without the hassle.',
    features: sampleFeatures,
    image: sampleImage,
    comparisons: sampleComparisons,
    callout: sampleCallout,
  },
};
