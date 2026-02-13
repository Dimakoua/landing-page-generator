# Themes Documentation

## Overview

Themes in the Landing Page Generator allow you to define the visual style of your landing pages through a simple JSON configuration. The theme system uses CSS custom properties (variables) to ensure consistent styling across all components.

## Theme Structure

A theme is defined in a `theme.json` file within each landing directory. The theme object contains several categories of properties that get converted to CSS variables.
**Security flag — `allowCustomHtml`**

- `allowCustomHtml` (boolean, optional) — When set to `true`, allows `customHtml` actions (runtime HTML injection) for this landing. Defaults to `false` for safety. See `docs/ACTION_DISPATCHER.md` and the `ActionDispatcher` policy for details.
- Recommended: keep `allowCustomHtml` set to `false` unless the landing requires trusted, vendor-provided snippets and you have verified the JSON source.
### Basic Theme Example

```json
{
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "accent": "#f59e0b",
    "background": "#ffffff",
    "text": "#1f2937",
    "muted": "#6b7280"
  },
  "fonts": {
    "heading": "system-ui, sans-serif",
    "body": "system-ui, sans-serif",
    "mono": "ui-monospace, monospace"
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem"
  },
  "radius": {
    "none": "0",
    "sm": "0.125rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
  }
}
```

## Theme Categories

### Colors

Define the color palette for your landing page. These become CSS custom properties like `--color-primary`.

```json
{
  "colors": {
    "primary": "#3b82f6",      // Main brand color
    "secondary": "#8b5cf6",    // Secondary accent
    "accent": "#f59e0b",       // Highlight color
    "background": "#ffffff",   // Page background
    "surface": "#f9fafb",      // Card/component backgrounds
    "text": "#1f2937",         // Primary text color
    "muted": "#6b7280",        // Secondary text
    "border": "#e5e7eb",       // Border colors
    "error": "#ef4444",        // Error states
    "success": "#10b981"       // Success states
  }
}
```

### Fonts

Specify font families for different text elements.

```json
{
  "fonts": {
    "heading": "Inter, system-ui, sans-serif",
    "body": "Inter, system-ui, sans-serif",
    "mono": "JetBrains Mono, ui-monospace, monospace",
    "display": "Cal Sans, Inter, system-ui, sans-serif"
  }
}
```

### Spacing

Define consistent spacing values used throughout components.

```json
{
  "spacing": {
    "xs": "0.25rem",   // 4px
    "sm": "0.5rem",    // 8px
    "md": "1rem",      // 16px
    "lg": "1.5rem",    // 24px
    "xl": "2rem",      // 32px
    "2xl": "3rem",     // 48px
    "3xl": "4rem"      // 64px
  }
}
```

### Border Radius

Control the rounded corners for buttons, cards, and other elements.

```json
{
  "radius": {
    "none": "0",
    "sm": "0.125rem",  // 2px
    "md": "0.375rem",  // 6px
    "lg": "0.5rem",    // 8px
    "xl": "0.75rem",   // 12px
    "2xl": "1rem",     // 16px
    "full": "9999px"   // Fully rounded
  }
}
```

### Shadows

Define box-shadow values for depth and elevation.

```json
{
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
  }
}
```

## How Themes Work

### Theme Injection

Themes are processed by the `ThemeInjector` component, which:

1. Converts the JSON theme to CSS custom properties
2. Injects them into the document's `:root` styles
3. Makes them available to all components via CSS variables

### Using Theme Variables in Components

Components automatically use theme variables. For example:

```css
/* Component styles */
.my-button {
  background-color: var(--color-primary);
  color: var(--color-background);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  font-family: var(--font-body);
  box-shadow: var(--shadow-sm);
}

.my-button:hover {
  background-color: var(--color-secondary);
}
```

### Component Props vs Theme Variables

Components can accept explicit props that override theme defaults:

```json
{
  "component": "Button",
  "props": {
    "variant": "primary",
    "size": "large"
  }
}
```

The component will use theme variables for colors, spacing, etc., but you can customize specific instances.

## Advanced Theme Features

### Theme Inheritance

Themes can extend base themes by importing and overriding values:

```json
{
  "extends": "base-theme",
  "colors": {
    "primary": "#10b981"  // Override just the primary color
  }
}
```

### Dark Mode Support

Themes can include dark mode variants:

```json
{
  "colors": {
    "light": {
      "background": "#ffffff",
      "text": "#1f2937"
    },
    "dark": {
      "background": "#1f2937",
      "text": "#ffffff"
    }
  }
}
```

### Responsive Themes

Different theme values for different screen sizes:

```json
{
  "spacing": {
    "mobile": {
      "md": "0.75rem"
    },
    "desktop": {
      "md": "1rem"
    }
  }
}
```

## Best Practices

### 1. Use Semantic Color Names

```json
{
  "colors": {
    "brand": "#3b82f6",      // Instead of "blue"
    "success": "#10b981",    // Instead of "green"
    "warning": "#f59e0b",    // Instead of "yellow"
    "danger": "#ef4444"      // Instead of "red"
  }
}
```

### 2. Consistent Spacing Scale

Use a consistent spacing scale (powers of 2 or 1.5):

```json
{
  "spacing": {
    "xs": "0.25rem",   // 4px
    "sm": "0.5rem",    // 8px
    "md": "1rem",      // 16px
    "lg": "2rem",      // 32px
    "xl": "4rem",      // 64px
    "2xl": "8rem"      // 128px
  }
}
```

### 3. Font Hierarchy

Define clear font roles:

```json
{
  "fonts": {
    "heading": "Inter, sans-serif",
    "subheading": "Inter, sans-serif",
    "body": "Inter, sans-serif",
    "caption": "Inter, sans-serif",
    "code": "JetBrains Mono, monospace"
  }
}
```

### 4. Theme Validation

Themes are validated against a schema to ensure required properties are present.

## Examples

### Minimal Theme

```json
{
  "colors": {
    "primary": "#3b82f6",
    "background": "#ffffff",
    "text": "#000000"
  },
  "fonts": {
    "body": "system-ui, sans-serif"
  }
}
```

### Complete Marketing Theme

```json
{
  "colors": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "accent": "#f59e0b",
    "background": "#ffffff",
    "surface": "#f8fafc",
    "text": "#1e293b",
    "muted": "#64748b",
    "border": "#e2e8f0",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444"
  },
  "fonts": {
    "heading": "Inter, system-ui, sans-serif",
    "body": "Inter, system-ui, sans-serif",
    "mono": "JetBrains Mono, ui-monospace, monospace"
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "radius": {
    "sm": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "2xl": "1rem",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)"
  }
}
```

## Troubleshooting

### Theme Not Applying

1. Check that `theme.json` is valid JSON
2. Ensure the theme file is in the correct landing directory
3. Verify that `ThemeInjector` is included in your layout
4. Check browser DevTools for CSS variable definitions

### Colors Look Wrong

1. Verify color values are valid hex codes (#RRGGBB or #RGB)
2. Check for typos in property names
3. Ensure components are using the correct CSS variables

### Fonts Not Loading

1. Confirm font family names match your CSS imports
2. Check that web fonts are properly loaded
3. Verify fallback fonts are specified

---

**Last Updated**: February 11, 2026  
**Version**: 1.0.0