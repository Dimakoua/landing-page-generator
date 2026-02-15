# Components Documentation

## Overview

Components are the building blocks of your landing pages. The system provides a rich set of pre-built React components that can be composed together to create complex layouts. Components are defined in JSON layouts and automatically receive action dispatchers and state management.

## Component Architecture

### Component Registration

All components must be registered in the `ComponentMap` to be used in layouts:

```typescript
// src/registry/ComponentMap.ts
import { lazy } from 'react';

export const ComponentMap = {
  // Sections
  Hero: lazy(() => import('../components/sections/Hero')),
  Features: lazy(() => import('../components/sections/Features')),
  SimpleCTA: lazy(() => import('../components/sections/SimpleCTA')),

  // Forms
  ContactForm: lazy(() => import('../components/forms/ContactForm')),

  // Layout
  Container: lazy(() => import('../components/layout/Container')),
  Grid: lazy(() => import('../components/layout/Grid')),
};
```

### Component Interface

All components receive standard props automatically:

```typescript
interface BaseComponentProps {
  // User-defined props from layout
  [key: string]: any;

  // Automatically injected
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}
```

## Actions in Components

Components can trigger actions in response to user interactions. Actions are defined in layout JSON and passed to components as named action objects.

### Named Actions vs Action Types

**Named Actions** are user-defined identifiers that components can trigger:

```json
{
  "component": "Pricing",
  "actions": {
    "selectPlan": { "type": "navigate", "url": "/checkout" },
    "contactSales": { "type": "navigate", "url": "/contact" }
  }
}
```

**Action Types** define what the action does:
- `navigate`, `setState`, `analytics`, `chain`, `conditional`, `api`, `delay`

### How Components Trigger Actions

Components trigger actions through the injected `dispatcher` and `actions` props:

```tsx
const MyComponent = ({ dispatcher, actions }) => {
  const handleClick = () => {
    if (dispatcher && actions?.selectPlan) {
      dispatcher.dispatch(actions.selectPlan);
    }
  };

  return <button onClick={handleClick}>Select Plan</button>;
};
```

### Action Naming Conventions

Components expect specific action names for common interactions:

- **`approve`**: Primary positive action (SimpleCTA, buttons)
- **`primary`/`secondary`**: Hero component buttons
- **`onSubmit`**: Form submission
- **`onChange`**: Value changes
- **Custom**: Component-specific names (Pricing uses `buttonAction` prop)

### Component-Action Linking Examples

**Hero Component:**
```json
{
  "component": "Hero",
  "props": {
    "primaryButton": { "label": "Get Started" },
    "secondaryButton": { "label": "Learn More" }
  },
  "actions": {
    "primary": { "type": "navigate", "url": "/signup" },
    "secondary": { "type": "navigate", "url": "#features" }
  }
}
```

**Pricing Component:**
```json
{
  "component": "Pricing",
  "props": {
    "plans": [
      { "name": "Basic", "buttonAction": "selectBasic" },
      { "name": "Pro", "buttonAction": "selectPro" }
    ]
  },
  "actions": {
    "selectBasic": {
      "type": "chain",
      "actions": [
        { "type": "setState", "key": "selectedPlan", "value": "basic" },
        { "type": "navigate", "url": "/checkout" }
      ]
    }
  }
}
```

## Section Components

### Hero

A prominent header section with primary and secondary call-to-action buttons.

```json
{
  "component": "Hero",
  "props": {
    "title": "Welcome to Our Product",
    "subtitle": "The best solution for your needs",
    "primaryButton": { "label": "Get Started" },
    "secondaryButton": { "label": "Learn More" }
  },
  "actions": {
    "primary": { "type": "navigate", "url": "/signup" },
    "secondary": { "type": "navigate", "url": "#features" }
  }
}
```

**Props:**
- `title`, `subtitle`: Content
- `primaryButton`, `secondaryButton`: CTA configurations
- `backgroundImage`, `variant`: Styling options

Triggers `primary`/`secondary` actions on button clicks.

### Features

Display product features or benefits in a grid or list layout.

```json
{
  "component": "Features",
  "props": {
    "title": "Why Choose Us?",
    "features": [
      { "icon": "⚡", "title": "Fast", "description": "Lightning quick" }
    ],
    "columns": 3
  }
}
```

**Props:** `title`, `features` (array), `columns`, `layout`

### SimpleCTA

A call-to-action button that triggers the `approve` action.

```json
{
  "component": "SimpleCTA",
  "props": { "text": "Get Started", "variant": "primary" },
  "actions": {
    "approve": { "type": "navigate", "url": "/signup" }
  }
}
```

**Props:** `text`, `variant`, `size`, `icon`

### Testimonials

Display customer testimonials or reviews.

```json
{
  "component": "Testimonials",
  "props": {
    "testimonials": [
      { "quote": "Great product!", "author": "John Doe", "rating": 5 }
    ]
  }
}
```

**Props:** `title`, `testimonials` (array), `variant`

### Pricing

Display pricing plans with customizable actions per plan.

```json
{
  "component": "Pricing",
  "props": {
    "plans": [
      { "name": "Basic", "price": "$9", "buttonAction": "selectBasic" },
      { "name": "Pro", "price": "$29", "buttonAction": "selectPro" }
    ]
  },
  "actions": {
    "selectBasic": { "type": "navigate", "url": "/checkout" },
    "selectPro": { "type": "navigate", "url": "/checkout" }
  }
}
```

**Props:** `title`, `plans` (with `buttonAction`), `highlighted`

Uses `buttonAction` prop to link each plan to specific actions.

### Stats

Display key statistics or metrics.

```json
{
  "component": "Stats",
  "props": {
    "title": "Our Impact",
    "stats": [
      {
        "value": "10M+",
        "label": "Active Users",
        "icon": "users"
      },
      {
        "value": "99.9%",
        "label": "Uptime",
        "icon": "shield"
      }
    ],
    "variant": "cards"
  }
}
```

**Props:**
- `title` (string): Section title
- `stats` (array): List of statistic objects
- `variant` ('cards' | 'list' | 'inline'): Display variant

### FAQ

Frequently asked questions section.

```json
{
  "component": "FAQ",
  "props": {
    "title": "Frequently Asked Questions",
    "questions": [
      {
        "question": "How does it work?",
        "answer": "It's simple! Just sign up and start using it immediately."
      }
    ],
    "variant": "accordion"
  }
}
```

**Props:**
- `title` (string): Section title
- `questions` (array): List of Q&A objects
- `variant` ('accordion' | 'list'): Display variant

## Form Components

### ContactForm

A contact or lead capture form.

```json
{
  "component": "ContactForm",
  "props": {
    "title": "Get In Touch",
    "fields": [
      {
        "name": "name",
        "type": "text",
        "label": "Full Name",
        "required": true,
        "placeholder": "Enter your name"
      },
      {
        "name": "email",
        "type": "email",
        "label": "Email Address",
        "required": true
      }
    ],
    "submitText": "Send Message"
  },
  "actions": {
    "onSubmit": {
      "type": "chain",
      "actions": [
        {
          "type": "post",
          "url": "/api/contact",
          "payload": "{{formData}}"
        },
        {
          "type": "navigate",
          "url": "/thank-you"
        }
      ]
    }
  }
}
```

**Props:**
- `title` (string): Form title
- `fields` (array): List of form field objects
- `submitText` (string): Submit button text

### NewsletterSignup

Email newsletter subscription form.

```json
{
  "component": "NewsletterSignup",
  "props": {
    "title": "Stay Updated",
    "subtitle": "Get the latest news and updates",
    "placeholder": "Enter your email",
    "buttonText": "Subscribe"
  },
  "actions": {
    "onSubmit": {
      "type": "post",
      "url": "/api/newsletter",
      "payload": { "email": "{{email}}" }
    }
  }
}
```

## Layout Components

### Container

A responsive container component.

```json
{
  "component": "Container",
  "props": {
    "maxWidth": "1200px",
    "padding": "2rem",
    "center": true
  },
  "sections": [
    {
      "component": "Hero",
      "props": { "title": "Contained Content" }
    }
  ]
}
```

**Props:**
- `maxWidth` (string): Maximum container width
- `padding` (string): Container padding
- `center` (boolean): Center horizontally

### Grid

A responsive grid layout component.

```json
{
  "component": "Grid",
  "props": {
    "columns": { "mobile": 1, "tablet": 2, "desktop": 3 },
    "gap": "2rem",
    "align": "start"
  },
  "sections": [
    { "component": "Card", "props": { "title": "Card 1" } },
    { "component": "Card", "props": { "title": "Card 2" } }
  ]
}
```

**Props:**
- `columns` (object): Responsive column counts
- `gap` (string): Gap between grid items
- `align` ('start' | 'center' | 'end'): Vertical alignment

## Media Components

### Video

Embed videos from various sources.

```json
{
  "component": "Video",
  "props": {
    "src": "https://example.com/video.mp4",
    "poster": "/images/video-poster.jpg",
    "autoplay": false,
    "controls": true,
    "loop": false
  }
}
```

**Props:**
- `src` (string): Video source URL
- `poster` (string): Poster image URL
- `autoplay` (boolean): Auto-play video
- `controls` (boolean): Show video controls
- `loop` (boolean): Loop video playback

### Gallery

Display a gallery of images.

```json
{
  "component": "Gallery",
  "props": {
    "images": [
      { "src": "/images/1.jpg", "alt": "Image 1" },
      { "src": "/images/2.jpg", "alt": "Image 2" }
    ],
    "variant": "grid",
    "lightbox": true
  }
}
```

**Props:**
- `images` (array): List of image objects
- `variant` ('grid' | 'carousel' | 'masonry'): Display variant
- `lightbox` (boolean): Enable lightbox viewing

## Interactive Components

### Tabs

Tabbed content interface.

```json
{
  "component": "Tabs",
  "props": {
    "tabs": [
      {
        "label": "Features",
        "content": {
          "component": "Features",
          "props": { "features": [...] }
        }
      }
    ],
    "defaultTab": 0
  }
}
```

### Accordion

Collapsible content sections.

```json
{
  "component": "Accordion",
  "props": {
    "items": [
      {
        "title": "How does it work?",
        "content": "It's simple and easy to use."
      }
    ],
    "multiple": false
  }
}
```

### Modal

Modal dialog component.

```json
{
  "component": "Modal",
  "props": {
    "trigger": {
      "component": "Button",
      "props": { "text": "Open Modal" }
    },
    "content": {
      "component": "ContactForm",
      "props": { "title": "Get Quote" }
    }
  }
}
```

## Dynamic Components

### LoadFromApi

A special component that dynamically loads and renders sections from an external API endpoint. This enables server-side composition of landing page content and dynamic component loading based on runtime data.

#### Props

- **`endpoint`** (string, required): The API endpoint URL to fetch component configuration from
- **`method`** (string, optional): HTTP method to use for the request. Defaults to "GET"
- **`onError`** (Action, optional): Action to dispatch if the API request fails
- **`cacheEnabled`** (boolean, optional): Enable caching of API responses. Defaults to false
- **`cacheKey`** (string, optional): Custom cache key. Auto-generated if not provided
- **`ttl`** (number, optional): Cache time-to-live in milliseconds. Defaults to 300000 (5 minutes)

#### API Response Format

The API endpoint must return a JSON object with a `sections` array:

```json
{
  "sections": [
    {
      "component": "Hero",
      "props": {
        "title": "Dynamic Hero Title",
        "subtitle": "Loaded from API"
      },
      "actions": {
        "primary": { "type": "navigate", "url": "/signup" }
      }
    },
    {
      "component": "Features",
      "props": {
        "items": [
          { "title": "Feature 1", "description": "Description" }
        ]
      }
    }
  ]
}
```

#### Usage Examples

**Basic API Loading:**
```json
{
  "component": "LoadFromApi",
  "props": {
    "endpoint": "/api/landing/sections",
    "method": "GET"
  }
}
```

**With Error Handling:**
```json
{
  "component": "LoadFromApi",
  "props": {
    "endpoint": "/api/cart/components",
    "method": "GET",
    "onError": {
      "type": "showError",
      "message": "Failed to load cart components. Please try again."
    }
  }
}
```

**With Caching (5-minute TTL):**
```json
{
  "component": "LoadFromApi",
  "props": {
    "endpoint": "/api/product/recommendations",
    "cacheEnabled": true,
    "ttl": 300000
  }
}
```

**With Custom Cache Key and Shorter TTL:**
```json
{
  "component": "LoadFromApi",
  "props": {
    "endpoint": "/api/user/preferences",
    "cacheEnabled": true,
    "cacheKey": "user_prefs_cache",
    "ttl": 60000
  }
}
```

#### Behavior

- **Loading State**: Shows "Loading components..." text while fetching
- **Error Handling**: Dispatches `onError` action on fetch failure or invalid response
- **Component Rendering**: Each section in the API response is rendered using the same engine as static layouts
- **State Interpolation**: Supports template strings like `"{{state.user.name}}"` in component props
- **Action Dispatching**: Actions defined in API response sections work identically to static actions
- **Caching**: When enabled, responses are cached in localStorage with TTL-based expiration
- **Cache Keys**: Auto-generated from endpoint URL and method, or custom key can be provided

#### Use Cases

- **Personalized Content**: Load different components based on user profile or A/B test results
- **Dynamic Product Pages**: Fetch product-specific components from a CMS
- **Server-Side Composition**: Allow backend services to compose landing pages
- **Real-time Updates**: Refresh component configurations without redeploying
- **Performance Optimization**: Cache frequently-used API responses to reduce load times
- **Offline Support**: Cached content remains available when network is unavailable

#### Cache Behavior

- **Storage**: Uses browser localStorage for persistence across sessions
- **Expiration**: Automatic cleanup of expired cache entries
- **Key Generation**: Base64-encoded endpoint URL + method if no custom key provided
- **Fallback**: Falls back to fresh API call if cache is invalid or expired
- **Logging**: Console logs indicate cache hits and storage operations

#### Error Scenarios

The component handles these error cases gracefully:

- **Network Errors**: Connection failures, timeouts
- **HTTP Errors**: 4xx/5xx status codes
- **Invalid Response**: Missing `sections` array or malformed JSON
- **Component Not Found**: Unknown component names in API response
- **Cache Errors**: Graceful fallback when localStorage is unavailable

## Analytics & Monitoring Components

### HeatmapRecorder

A comprehensive user interaction tracking component for data-driven design optimization.

#### Props

- **`enabled`** (boolean, optional): Enable/disable tracking. Defaults to true
- **`trackClicks`** (boolean, optional): Track click events. Defaults to true
- **`trackScroll`** (boolean, optional): Track scroll depth. Defaults to true
- **`trackAttention`** (boolean, optional): Track element visibility and attention. Defaults to true
- **`sampleRate`** (number, optional): Percentage of users to track (0-1). Defaults to 1.0
- **`onDataCollected`** (function, optional): Callback when data is collected
- **`autoSend`** (boolean, optional): Automatically send data at intervals. Defaults to true
- **`sendInterval`** (number, optional): Auto-send interval in milliseconds. Defaults to 30000 (30s)
- **`analyticsProvider`** ('google_analytics' | 'custom', optional): Analytics service to send data to
- **`customEndpoint`** (string, optional): Custom API endpoint for data sending
- **`dispatcher`** (ActionDispatcher, optional): Action dispatcher for collect actions
- **`collectAction`** (Action, optional): Action to dispatch when collecting data
- **`excludeSelectors`** (string[], optional): CSS selectors to exclude from tracking
- **`includeSelectors`** (string[], optional): CSS selectors to include (if specified, only these are tracked)
- **`anonymize`** (boolean, optional): Remove identifying information from tracked data. Defaults to false
- **`respectDNT`** (boolean, optional): Respect Do Not Track browser setting. Defaults to true

#### Features

**Click Tracking:**
- Records click coordinates and target elements
- Tracks interactive elements (buttons, links, inputs)
- Supports custom include/exclude selectors

**Scroll Depth Tracking:**
- Measures maximum scroll depth achieved
- Tracks time to reach scroll milestones (10%, 20%, etc.)
- Records total scrolling time

**Attention Metrics:**
- Uses Intersection Observer API for visibility tracking
- Measures time spent viewing elements
- Tracks user interactions per element

**Privacy & Compliance:**
- Respects Do Not Track browser setting
- Optional data anonymization
- Configurable sampling rate

#### Usage Examples

**Basic Heatmap Tracking:**
```json
{
  "component": "HeatmapRecorder",
  "props": {
    "enabled": true,
    "trackClicks": true,
    "trackScroll": true,
    "trackAttention": true
  }
}
```

**Google Analytics Integration:**
```json
{
  "component": "HeatmapRecorder",
  "props": {
    "analyticsProvider": "google_analytics",
    "sampleRate": 0.1,
    "sendInterval": 60000
  }
}
```

**Custom Analytics with Privacy:**
```json
{
  "component": "HeatmapRecorder",
  "props": {
    "customEndpoint": "/api/analytics/heatmap",
    "anonymize": true,
    "respectDNT": true,
    "excludeSelectors": [".admin-panel", "[data-private]"],
    "includeSelectors": [".product-card", ".cta-button"]
  }
}
```

**Action-Based Data Collection:**
```json
{
  "component": "HeatmapRecorder",
  "props": {
    "dispatcher": "dispatcher",
    "collectAction": {
      "type": "analytics",
      "event": "heatmap_data",
      "data": "{{heatmapData}}"
    },
    "autoSend": false
  },
  "actions": {
    "collectAction": {
      "type": "api",
      "url": "/api/heatmap",
      "method": "POST",
      "payload": "{{formData}}"
    }
  }
}
```

#### Data Structure

The component collects data in this format:

```typescript
interface HeatmapData {
  clicks: Array<{
    x: number;          // Click X coordinate
    y: number;          // Click Y coordinate
    element: string;    // Element description
    timestamp: number;  // Click timestamp
    page: string;       // Page path
  }>;
  scrollDepth: {
    maxDepth: number;              // Maximum scroll percentage
    timeToDepth: Record<number, number>; // Time to reach each depth milestone
    totalScrollTime: number;       // Total time spent scrolling
  };
  attention: Array<{
    element: string;    // Element description
    timeSpent: number;  // Total time element was visible
    visibleTime: number; // Time element was in viewport
    interactions: number; // Number of interactions
  }>;
}
```

#### Integration Options

**Google Analytics:**
- Automatically sends events with custom parameters
- Integrates with existing GA4 setup

**Custom Endpoint:**
- POSTs JSON data to specified URL
- Handles network failures gracefully

**Action System:**
- Dispatches custom actions with collected data
- Enables complex workflows and data processing

#### Privacy Considerations

- **Do Not Track**: Respects browser DNT setting
- **Anonymization**: Removes element IDs, classes, and text content
- **Sampling**: Only tracks percentage of users to reduce data volume
- **Selective Tracking**: Include/exclude specific elements

#### Performance Impact

- **Minimal Overhead**: Uses efficient event delegation
- **Throttled Events**: Scroll tracking throttled to 100ms
- **Lazy Initialization**: Only activates when enabled
- **Memory Management**: Automatic cleanup on component unmount

## Creating Custom Components

### 1. Create the Component

```tsx
interface CustomHeroProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
}

const CustomHero: React.FC<CustomHeroProps> = ({
  title,
  subtitle,
  dispatcher,
  actions
}) => {
  const handleClick = () => {
    if (dispatcher && actions?.approve) {
      dispatcher.dispatch(actions.approve);
    }
  };

  return (
    <section>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <button onClick={handleClick}>Click</button>
    </section>
  );
};
```

### 2. Register the Component

Add to `ComponentMap.ts`:

```typescript
export const ComponentMap = {
  CustomHero: lazy(() => import('../components/CustomHero')),
};
```

### 3. Use in Layout

```json
{
  "component": "CustomHero",
  "props": { "title": "Hello", "subtitle": "World" },
  "actions": {
    "approve": { "type": "navigate", "url": "/next" }
  }
}
```

## Component Best Practices

### 1. Handle Actions Properly

```tsx
const MyComponent = ({ dispatcher, actions }) => {
  const handleClick = () => {
    if (dispatcher && actions?.approve) {
      dispatcher.dispatch(actions.approve);
    }
  };

  return <button onClick={handleClick}>Click</button>;
};
```

### 2. Responsive Design

Use CSS media queries or responsive utilities. Device-specific layouts are handled at the layout level with `desktop.json` and `mobile.json` files.

### 3. Type Safety

```tsx
interface MyComponentProps extends BaseComponentProps {
  title: string;
  variant?: 'primary' | 'secondary';
}
```

### 4. Accessibility

Use semantic HTML and ARIA attributes for screen readers.

## Troubleshooting

### Component Not Found
- Check component is registered in `ComponentMap.ts`
- Verify import path is correct
- Ensure component is exported as default

### Props Not Working
- Check prop names match component interface
- Verify prop types are correct

### Actions Not Firing
- Confirm `dispatcher` prop is passed
- Check action definitions in layout
- Verify action names match component usage