# Layouts Documentation

## Overview

Layouts define the visual structure and content of each step in your landing page flow. Each step can have separate layouts for desktop and mobile devices, allowing for highly optimized user experiences across different screen sizes.

## Layout Structure

Layouts are defined in JSON files within each step's directory:

```
steps/
├── home/
│   ├── desktop.json
│   └── mobile.json
├── features/
│   ├── desktop.json
│   └── mobile.json
└── ...
```

### Basic Layout Example

```json
{
  "sections": [
    {
      "component": "Navigation",
      "props": {
        "logo": "My Brand",
        "links": [
          { "label": "Features", "href": "#features" },
          { "label": "Pricing", "href": "#pricing" }
        ]
      }
    },
    {
      "component": "Hero",
      "props": {
        "title": "Welcome to Our Product",
        "subtitle": "The best solution for your needs"
      }
    },
    {
      "component": "TwoColumnSection",
      "props": {
        "title": "Why Choose Us",
        "content": "We offer the best services in the industry."
      },
      "actions": {
        "primary": {
          "type": "navigate",
          "url": "/features"
        }
      }
    }
  ]
}
```

## Section Definition

Each section in the `sections` array represents a component to render on the page.

### Basic Section

```json
{
  "component": "Hero",
  "props": {
    "title": "Hello World",
    "subtitle": "Welcome to our landing page"
  }
}
```

### Section with Actions

```json
{
  "component": "Hero",
  "props": {
    "title": "Sign Up Now",
    "subtitle": "Join thousands of users"
  },
  "actions": {
    "approve": {
      "type": "chain",
      "actions": [
        {
          "type": "analytics",
          "event": "cta_clicked"
        },
        {
          "type": "navigate",
          "url": "/signup"
        }
      ]
    }
  }
}
```

## Section Properties

### Required Properties

- **`component`** (string): The name of the React component to render. Must match a registered component.

### Optional Properties

- **`props`** (object): Properties to pass to the component.
- **`actions`** (object): Action definitions for user interactions.

## Component Props

Components receive props defined in the layout plus automatically injected props:

### Automatic Props

```typescript
interface ComponentProps {
  // User-defined props from layout
  ...props,

  // Automatically injected
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
  state?: Record<string, unknown>;
}
```

### Example Component Usage

```tsx
import React from 'react';
import { ActionDispatcher, Action } from '../../engine/ActionDispatcher';

interface MyComponentProps {
  title: string;
  subtitle?: string;
  dispatcher?: ActionDispatcher;
  actions?: Record<string, Action>;
}

const MyComponent: React.FC<MyComponentProps> = ({
  title,
  subtitle,
  dispatcher,
  actions
}) => {
  const handleClick = () => {
    if (dispatcher && actions?.primary) {
      dispatcher.dispatch(actions.primary);
    }
  };

  return (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
};
```

## Actions in Layouts

Actions define interactive behavior for components:

### Action Definition

```json
{
  "actions": {
    "primary": {
      "type": "navigate",
      "url": "/next"
    },
    "secondary": {
      "type": "analytics",
      "event": "button_click"
    },
    "complex": {
      "type": "chain",
      "actions": [
        { "type": "setState", "key": "clicked", "value": true },
        { "type": "navigate", "url": "/success" }
      ]
    }
  }
}
```

### Action Naming Convention

- **`approve`**: Primary positive action (e.g., "Yes", "Continue", "Buy")
- **`reject`**: Primary negative action (e.g., "No", "Cancel", "Skip")
- **`default`**: Fallback action
- **`onClick`**: General click handler
- **`onSubmit`**: Form submission
- **`onChange`**: Value change handler

## Device-Specific Layouts

### Desktop Layout

Optimized for larger screens (1024px+):

```json
{
  "sections": [
    {
      "component": "Hero",
      "props": {
        "title": "Desktop-First Design",
        "layout": "wide"
      }
    },
    {
      "component": "FeatureGrid",
      "props": {
        "columns": 3,
        "features": [...]
      }
    }
  ]
}
```

### Mobile Layout

Optimized for smaller screens:

```json
{
  "sections": [
    {
      "component": "Hero",
      "props": {
        "title": "Mobile-Optimized",
        "layout": "stacked"
      }
    },
    {
      "component": "FeatureList",
      "props": {
        "features": [...]
      }
    }
  ]
}
```

### Responsive Considerations

- Use different component variants for different screen sizes
- Adjust content density (more columns on desktop, stacked on mobile)
- Consider touch targets and spacing
- Optimize images and media

## Advanced Layout Features

### Dynamic Content

Load content dynamically using state interpolation:

```json
{
  "sections": [
    {
      "component": "ProductList",
      "props": {
        "category": "{{state.selectedCategory}}",
        "limit": 10
      }
    }
  ]
}
```

State interpolation allows you to dynamically insert values from the engine state into component props. Use the `{{key}}` syntax to reference state values, with support for nested objects like `{{contactForm.name}}`.

## Component Registry

Components must be registered in the `ComponentMap` to be used in layouts:

```typescript
// src/registry/ComponentMap.ts
import { lazy } from 'react';

export const ComponentMap = {
  Hero: lazy(() => import('../components/sections/Hero')),
  SimpleCTA: lazy(() => import('../components/sections/SimpleCTA')),
  Features: lazy(() => import('../components/sections/Features')),
  // ... more components
};
```

## Layout Validation

Layouts are validated against schemas to ensure:

- Required properties are present
- Component names are registered
- Action definitions are valid
- Props match component interfaces

## Examples

### Simple Landing Page

```json
{
  "sections": [
    {
      "component": "Hero",
      "props": {
        "title": "Welcome to Our Service",
        "subtitle": "The easiest way to get started",
        "ctaText": "Get Started"
      },
      "actions": {
        "approve": {
          "type": "navigate",
          "url": "/signup"
        }
      }
    },
    {
      "component": "Features",
      "props": {
        "title": "Why Choose Us?",
        "features": [
          {
            "icon": "⚡",
            "title": "Fast",
            "description": "Lightning-quick performance"
          },
          {
            "icon": "🔒",
            "title": "Secure",
            "description": "Bank-level security"
          }
        ]
      }
    },
    {
      "component": "SimpleCTA",
      "props": {
        "text": "Start Your Free Trial"
      },
      "actions": {
        "approve": {
          "type": "navigate",
          "url": "/trial"
        }
      }
    }
  ]
}
```

### E-commerce Product Page

```json
{
  "sections": [
    {
      "component": "ProductHero",
      "props": {
        "title": "Premium Widget",
        "price": "$99",
        "image": "/images/widget.jpg"
      },
      "actions": {
        "approve": {
          "type": "chain",
          "actions": [
            {
              "type": "analytics",
              "event": "add_to_cart",
              "properties": { "product": "widget" }
            },
            {
              "type": "navigate",
              "url": "/checkout"
            }
          ]
        }
      }
    },
    {
      "component": "ProductFeatures",
      "props": {
        "features": [...]
      }
    },
    {
      "component": "Testimonials",
      "props": {
        "testimonials": [...]
      }
    }
  ]
}
```

### Multi-step Form

```json
{
  "sections": [
    {
      "component": "Form",
      "props": {
        "title": "Contact Information",
        "fields": [
          { "name": "email", "type": "email", "required": true },
          { "name": "phone", "type": "tel" }
        ]
      },
      "actions": {
        "onSubmit": {
          "type": "chain",
          "actions": [
            {
              "type": "setState",
              "key": "contactInfo",
              "value": "{{formData}}"
            },
            {
              "type": "navigate",
              "url": "/step-2"
            }
          ]
        }
      }
    }
  ]
}
```

## Best Practices

### 1. Keep Layouts Simple

- Limit sections per page to 5-7 maximum
- Use clear, descriptive component names
- Group related functionality together

### 2. Optimize for Each Device

```json
// desktop.json - Use grid layouts
{
  "component": "FeatureGrid",
  "props": { "columns": 3 }
}

// mobile.json - Use stacked layouts
{
  "component": "FeatureList",
  "props": { "layout": "stacked" }
}
```

### 3. Consistent Action Patterns

```json
{
  "actions": {
    "approve": { "type": "navigate", "url": "/next" },
    "reject": { "type": "navigate", "url": "/cancel" },
    "default": { "type": "navigate", "url": "/" }
  }
}
```

### 4. Progressive Enhancement

Start with basic functionality, add advanced features:

```json
{
  "sections": [
    {
      "component": "BasicCTA",
      "props": { "text": "Click Here" },
      "actions": {
        "approve": { "type": "navigate", "url": "/next" }
      }
    }
  ]
}
```

### 5. Error Handling

Always provide fallback actions:

```json
{
  "actions": {
    "approve": {
      "type": "post",
      "url": "/api/submit",
      "onSuccess": { "type": "navigate", "url": "/success" },
      "onError": { "type": "navigate", "url": "/error" }
    }
  }
}
```

## Troubleshooting

### Component Not Rendering

1. Check that component is registered in `ComponentMap.ts`
2. Verify component name matches exactly (case-sensitive)
3. Ensure all required props are provided

### Actions Not Working

1. Check that `dispatcher` is passed to components
2. Verify action definitions are valid
3. Look for console errors in browser DevTools

### Layout Not Loading

1. Confirm JSON is valid
2. Check file paths match step IDs
3. Verify `LayoutResolver` is configured correctly

### Props Not Applying

1. Check prop names match component interface
2. Verify prop types are correct
3. Look for TypeScript errors in console

---

**Last Updated**: February 11, 2026  
**Version**: 1.0.0