import type { Preview } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import '../src/index.css';

// Mock ActionDispatcher for stories
const mockDispatcher = {
  dispatch: async (actionObj: any) => {
    action('dispatch')(actionObj);
    return { success: true };
  },
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, context) => (
      <Story {...context.args} dispatcher={mockDispatcher} />
    ),
  ],
};

export default preview;