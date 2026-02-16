import type { Meta, StoryObj } from '@storybook/react';
import HeatmapRecorder from './HeatmapRecorder';

const meta: Meta<typeof HeatmapRecorder> = {
  title: 'Components/HeatmapRecorder',
  component: HeatmapRecorder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Invisible component that tracks user interactions for analytics. Use the controls to configure tracking behavior.',
      },
    },
  },
  argTypes: {
    enabled: { control: 'boolean' },
    trackClicks: { control: 'boolean' },
    trackScroll: { control: 'boolean' },
    trackAttention: { control: 'boolean' },
    sampleRate: { control: { type: 'number', min: 0, max: 1, step: 0.1 } },
    autoSend: { control: 'boolean' },
    sendInterval: { control: 'number' },
    analyticsProvider: { control: 'select', options: ['google_analytics', 'custom'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    enabled: true,
    trackClicks: true,
    trackScroll: true,
    trackAttention: true,
    sampleRate: 1.0,
    autoSend: true,
    sendInterval: 30000,
    analyticsProvider: 'google_analytics',
  },
};

export const MinimalTracking: Story = {
  args: {
    enabled: true,
    trackClicks: true,
    trackScroll: false,
    trackAttention: false,
    sampleRate: 0.5,
    autoSend: false,
  },
};

export const CustomEndpoint: Story = {
  args: {
    enabled: true,
    trackClicks: true,
    trackScroll: true,
    trackAttention: true,
    sampleRate: 1.0,
    autoSend: true,
    sendInterval: 60000,
    analyticsProvider: 'custom',
    customEndpoint: 'https://api.example.com/analytics',
  },
};