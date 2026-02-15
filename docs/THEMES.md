# Themes Documentation

## Overview

Themes in the Landing Page Generator allow you to define the visual style of your landing pages through a simple JSON configuration. The theme system uses CSS custom properties (variables) to ensure consistent styling across all components.

## Theme Structure

A theme is defined in a \`theme.json\` file within each landing directory. The theme object contains several categories of properties that get converted to CSS variables.

**Security flag — \`allowCustomHtml\`**

- \`allowCustomHtml\` (boolean, optional) — When set to \`true\`, allows \`customHtml\` actions (runtime HTML injection) for this landing. Defaults to \`false\` for safety. See \`docs/ACTION_DISPATCHER.md\` for details.

### Basic Theme Example

\`\`\`json
{
  "colors": {
    "primary": "#3b82f6",
    "background-light": "#ffffff",
    "background-dark": "#0f172a",
    "text-main": "#1e293b"
  },
  "fonts": {
    "body": "Inter, sans-serif",
    "heading": "Outfit, sans-serif"
  },
  "spacing": {
    "section": "5rem",
    "gap": "1rem"
  },
  "radius": {
    "button": "0.5rem",
    "card": "1rem"
  }
}
\`\`\`

## Theme Categories

### Colors

Define the color palette for your landing page. These become CSS custom properties like \`--color-primary\`.

\`\`\`json
{
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "background-light": "#ffffff",
    "background-dark": "#0f172a",
    "text-main": "#1e293b",
    "border": "#e5e7eb"
  }
}
\`\`\`

### Fonts

Specify font families for different text elements.

\`\`\`json
{
  "fonts": {
    "heading": "system-ui, sans-serif",
    "body": "system-ui, sans-serif",
    "mono": "ui-monospace, monospace"
  }
}
\`\`\`

### Spacing

Define consistent spacing values used throughout components.

\`\`\`json
{
  "spacing": {
    "gap": "1rem",
    "section": "4rem",
    "container": "80rem"
  }
}
\`\`\`

### Border Radius

Control the rounded corners for buttons, cards, and other elements.

\`\`\`json
{
  "radius": {
    "button": "0.125rem",
    "card": "0.375rem",
    "input": "0.5rem"
  }
}
\`\`\`

## How Themes Work

### Theme Injection

Themes are processed by the \`ThemeInjector\` component, which:

1. Converts the JSON theme to CSS custom properties (e.g., \`colors.primary\` -> \`--color-primary\`).
2. Injects them into the document's \`:root\` styles.
3. Makes them available to all components via CSS variables.

### Using Theme Variables in Components

Components automatically use theme variables. For example:

\`\`\`css
/* Component styles */
.my-button {
  background-color: var(--color-primary);
  color: var(--color-background-light);
  border-radius: var(--radius-button);
  padding: var(--spacing-gap);
  font-family: var(--font-body);
}

.my-button:hover {
  filter: brightness(0.9);
}
\`\`\`

### Component Props vs Theme Variables

Components can accept explicit props that override theme defaults. The component will use theme variables for colors, spacing, etc. by default, but you can customize specific instances via the layout JSON.

## Best Practices

### 1. Use Semantic Color Names
Use names like \`primary\`, \`secondary\`, and \`background-light\` rather than specific colors like \`blue\` or \`white\`.

### 2. Consistent Spacing Scale
Keep a consistent scale for spacing to ensure layout harmony.

### 3. Font Hierarchy
Define clear font roles for headings and body text.

## Troubleshooting

### Theme Not Applying
1. Check that \`theme.json\` is valid JSON.
2. Ensure the theme file is in the correct landing directory.
3. Check browser DevTools for CSS variable definitions on the \`:root\` element.

### Colors Look Wrong
1. Verify color values are valid hex codes (#RRGGBB).
2. Check for typos in property names.

### Fonts Not Loading
1. Confirm font family names match your CSS imports.
