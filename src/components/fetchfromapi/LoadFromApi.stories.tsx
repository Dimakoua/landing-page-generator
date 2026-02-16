import type { Meta, StoryObj } from '@storybook/react';
import LoadFromApi from './LoadFromApi';

const meta: Meta<typeof LoadFromApi> = {
  title: 'Components/LoadFromApi',
  component: LoadFromApi,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Component that loads and renders sections from an API endpoint. This story demonstrates the loading behavior.',
      },
    },
  },
  argTypes: {
    endpoint: { control: 'text' },
    method: { control: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
    cacheEnabled: { control: 'boolean' },
    cacheKey: { control: 'text' },
    ttl: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    endpoint: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    cacheEnabled: false,
  },
};

export const WithCaching: Story = {
  args: {
    endpoint: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    cacheEnabled: true,
    cacheKey: 'sample_post',
    ttl: 300000, // 5 minutes
  },
};

export const PostRequest: Story = {
  args: {
    endpoint: 'https://jsonplaceholder.typicode.com/posts',
    method: 'POST',
    cacheEnabled: false,
  },
};