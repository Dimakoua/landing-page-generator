import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import themeCollector from '../plugins/theme-collector';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [themeCollector()],
    });
  },
};
export default config;