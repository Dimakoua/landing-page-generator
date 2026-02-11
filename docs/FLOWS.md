# Flows Documentation

## Overview

Flows define the navigation structure and user journey through your landing page. A flow is a sequence of steps that users can navigate between, creating a funnel-like experience. Flows are defined in `flow.json` files and work with the navigation system to provide a structured user experience.

## Flow Structure

A flow is defined as a JSON object with a `steps` array containing step definitions.

### Basic Flow Example

```json
{
  "steps": [
    { "id": "home" },
    { "id": "features" },
    { "id": "pricing" },
    { "id": "checkout" },
    { "id": "success" }
  ]
}
```

## Step Definition

Each step in the flow is an object with the following properties:

### Basic Step

```json
{
  "id": "home",
  "type": "normal"
}
```

### Popup Step

```json
{
  "id": "newsletter-signup",
  "type": "popup"
}
```

## Step Properties

### Required Properties

- **`id`** (string): Unique identifier for the step. Must match the directory name in `steps/`.

### Optional Properties

- **`type`** (enum): Step type - either `"normal"` (default) or `"popup"`.

## Flow Navigation

### Automatic Navigation

Flows work with the Action Dispatcher's `navigate` action:

```json
{
  "type": "navigate",
  "url": "/checkout"
}
```

The navigation system automatically:
1. Validates the target step exists in the flow
2. Determines if it's a popup or normal step
3. Updates the browser URL with history management
4. Loads the appropriate layout (desktop/mobile)

### URL-Based Navigation

The system uses URL parameters to maintain navigation state:

- Default step: `https://example.com/landing`
- Specific step: `https://example.com/landing?step=pricing`
- Popup steps overlay on the current base step

### Popup Steps

Popup steps appear as modal overlays without changing the base page:

```json
{
  "steps": [
    { "id": "home" },
    { "id": "features" },
    { "id": "newsletter-signup", "type": "popup" }
  ]
}
```

When navigating to a popup step, it opens as an overlay while keeping the base step visible underneath.

## Device-Specific Flows

The system supports different flows for desktop and mobile devices:

```
src/landings/my-landing/
├── flow.json              # Shared flow (fallback)
├── flow-desktop.json      # Desktop-specific flow
└── flow-mobile.json       # Mobile-specific flow
```

### Example Desktop Flow

```json
{
  "steps": [
    { "id": "hero" },
    { "id": "features-grid" },
    { "id": "pricing-table" },
    { "id": "checkout" }
  ]
}
```

### Example Mobile Flow

```json
{
  "steps": [
    { "id": "hero-mobile" },
    { "id": "features-list" },
    { "id": "pricing-cards" },
    { "id": "checkout-mobile" }
  ]
}
```

## Flow Variants (A/B Testing)

Flows support A/B testing through variant files:

```
src/landings/my-landing/
├── flow.json              # Control flow
├── flow-A.json            # Variant A flow
└── flow-B.json            # Variant B flow
```

## Integration with Actions

### Navigation Actions

```json
{
  "actions": {
    "next": {
      "type": "navigate",
      "url": "/next-step"
    },
    "previous": {
      "type": "navigate",
      "url": "/previous-step"
    },
    "openPopup": {
      "type": "navigate",
      "url": "/newsletter-signup"
    }
  }
}
```

### Flow Progress Tracking

```json
{
  "actions": {
    "completeStep": {
      "type": "chain",
      "actions": [
        {
          "type": "analytics",
          "event": "step_completed",
          "properties": {
            "step": "features"
          }
        },
        {
          "type": "navigate",
          "url": "/pricing"
        }
      ]
    }
  }
}
```

## Examples

### Simple Product Launch Funnel

```json
{
  "steps": [
    { "id": "hero" },
    { "id": "features" },
    { "id": "pricing" },
    { "id": "signup" },
    { "id": "confirmation" }
  ]
}
```

### E-commerce Checkout Flow

```json
{
  "steps": [
    { "id": "product" },
    { "id": "cart" },
    { "id": "shipping" },
    { "id": "payment" },
    { "id": "confirmation" }
  ]
}
```

### Flow with Popup

```json
{
  "steps": [
    { "id": "home" },
    { "id": "features" },
    { "id": "pricing" },
    { "id": "newsletter-signup", "type": "popup" },
    { "id": "checkout" },
    { "id": "success" }
  ]
}
```

## Best Practices

### 1. Keep Flows Simple

- Limit flows to 5-7 steps maximum
- Use clear, descriptive step IDs
- Avoid complex branching unless necessary

### 2. Progressive Disclosure

```json
{
  "steps": [
    { "id": "overview" },      // High-level info
    { "id": "details" },       // More specific info
    { "id": "comparison" },    // Help with decision
    { "id": "signup" }         // Conversion action
  ]
}
```

### 3. Clear Call-to-Actions

Each step should have a clear primary action:

```json
{
  "sections": [
    {
      "component": "Hero",
      "props": { "title": "Welcome" }
    },
    {
      "component": "SimpleCTA",
      "props": { "text": "Learn More" },
      "actions": {
        "approve": {
          "type": "navigate",
          "url": "/features"
        }
      }
    }
  ]
}
```

### 4. Handle Edge Cases

Always provide paths for common scenarios:

```json
{
  "actions": {
    "continue": { "type": "navigate", "url": "/next" },
    "skip": { "type": "navigate", "url": "/skip-step" },
    "back": { "type": "navigate", "url": "/previous" }
  }
}
```

### 5. Analytics Integration

Track flow progress and drop-off points:

```json
{
  "actions": {
    "enterStep": {
      "type": "analytics",
      "event": "step_viewed",
      "properties": {
        "step": "pricing",
        "flow": "purchase"
      }
    }
  }
}
```

## Troubleshooting

### Navigation Not Working

1. Check that step IDs match between `flow.json` and `steps/` directories
2. Verify the navigation action URL matches a step ID
3. Ensure the `LayoutResolver` is properly configured

### Steps Not Loading

1. Confirm `desktop.json` and `mobile.json` exist for each step
2. Check that component names in layouts match registered components
3. Verify theme is properly loaded

### Popup Steps Not Working

1. Ensure step `type` is set to `"popup"`
2. Check that popup layouts exist in the step directory
3. Verify the popup component is properly integrated

---

**Last Updated**: February 11, 2026  
**Version**: 1.0.0