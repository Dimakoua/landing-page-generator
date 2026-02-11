# A/B Testing Configuration

## Overview

A/B testing allows you to compare different versions of your landing pages by creating variant configurations. The system uses suffix notation (A, B, C, etc.) in JSON file names to define test variants.

## Variant File Structure

Create variant files within your landing directory using suffix notation:

```
src/landings/
└── ecommerce_product_page/
    ├── flow-A.json           # Flow configuration for variant A
    ├── flow-B.json           # Flow configuration for variant B
    ├── theme-A.json          # Theme configuration for variant A
    ├── theme-B.json          # Theme configuration for variant B
    └── steps/
        ├── home/
        │   ├── desktop-A.json # Layout configuration for variant A
        │   ├── desktop-B.json # Layout configuration for variant B
        │   ├── mobile-A.json
        │   └── mobile-B.json
        ├── cart/
        │   ├── desktop-A.json
        │   ├── desktop-B.json
        │   ├── mobile-A.json
        │   └── mobile-B.json
        └── checkout/
            ├── desktop-A.json
            ├── desktop-B.json
            ├── mobile-A.json
            └── mobile-B.json
```

## Configuration Examples

### Flow Variants

Test different navigation flows:

```json
// flow-A.json - Standard flow
{
  "steps": [
    {
      "id": "home",
      "type": "normal"
    },
    {
      "id": "cart",
      "type": "normal"
    },
    {
      "id": "checkout",
      "type": "normal"
    }
  ]
}

// flow-B.json - Extended flow with success page
{
  "steps": [
    {
      "id": "home",
      "type": "normal"
    },
    {
      "id": "cart",
      "type": "normal"
    },
    {
      "id": "checkout",
      "type": "normal"
    },
    {
      "id": "success",
      "type": "normal"
    }
  ]
}
```

### Theme Variants

Test different visual themes:

```json
// theme-A.json - Minimal theme
{
  "colors": {
    "primary": "#000000",
    "background-light": "#ffffff",
    "background-dark": "#000000"
  },
  "fonts": {
    "display": "Inter, sans-serif"
  }
}

// theme-B.json - Colorful theme
{
  "colors": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "background-light": "#f8fafc",
    "background-dark": "#1e293b"
  },
  "fonts": {
    "display": "Inter, sans-serif"
  }
}
```

### Layout Variants

Test different component configurations:

```json
// desktop-A.json - Hero-focused layout
{
  "sections": [
    {
      "component": "Hero",
      "props": {
        "title": "Welcome to Our Platform",
        "subtitle": "The best solution for your needs",
        "primaryButton": {
          "text": "Get Started",
          "variant": "primary"
        }
      }
    },
    {
      "component": "Features",
      "props": {
        "title": "Key Features",
        "features": [
          { "title": "Fast", "description": "Quick setup" },
          { "title": "Easy", "description": "Simple to use" }
        ]
      }
    }
  ]
}

// desktop-B.json - Features-first layout
{
  "sections": [
    {
      "component": "Features",
      "props": {
        "title": "Why Choose Us",
        "features": [
          { "title": "Lightning Fast", "description": "Get started in under 5 minutes" },
          { "title": "Incredibly Easy", "description": "No coding required" },
          { "title": "Powerful", "description": "Advanced features included" }
        ]
      }
    },
    {
      "component": "Hero",
      "props": {
        "title": "Transform Your Workflow",
        "subtitle": "Join thousands of satisfied users",
        "primaryButton": {
          "text": "Start Free Trial",
          "variant": "secondary"
        }
      }
    }
  ]
}
```

## Component Variants

### Call-to-Action Testing

```json
// Variant A - Primary button
{
  "component": "SimpleCTA",
  "props": {
    "text": "Get Started Free",
    "variant": "primary"
  }
}

// Variant B - Secondary button
{
  "component": "SimpleCTA",
  "props": {
    "text": "Start Your Trial",
    "variant": "secondary"
  }
}
```

### Headline Testing

```json
// Variant A - Benefit-focused
{
  "component": "Hero",
  "props": {
    "title": "Save Time and Money",
    "subtitle": "Automate your workflow today"
  }
}

// Variant B - Feature-focused
{
  "component": "Hero",
  "props": {
    "title": "Advanced Analytics Dashboard",
    "subtitle": "Powerful insights at your fingertips"
  }
}
```

## Analytics Configuration

### Conversion Tracking

Configure conversion tracking in your component actions:

```json
{
  "component": "SimpleCTA",
  "props": {
    "text": "Sign Up Now"
  },
  "actions": {
    "onClick": {
      "type": "chain",
      "actions": [
        {
          "type": "analytics",
          "event": "conversion",
          "properties": {
            "variant": "{{variant}}",
            "goal": "signup"
          }
        },
        {
          "type": "navigate",
          "step": "checkout"
        }
      ]
    }
  }
}
```

### Page View Tracking

Track which variants users see:

```json
{
  "sections": [
    {
      "component": "AnalyticsTracker",
      "props": {
        "event": "page_view",
        "properties": {
          "variant": "{{variant}}",
          "page": "home"
        }
      }
    }
  ]
}
```

## Test Documentation

Document your A/B tests in JSON format:

```json
{
  "abTest": {
    "id": "cta-button-color-2026-q1",
    "hypothesis": "Red buttons convert better than blue",
    "variants": {
      "A": "blue-button",
      "B": "red-button"
    },
    "metrics": ["click_rate", "conversion_rate"],
    "startDate": "2026-02-01",
    "endDate": "2026-02-15"
  }
}
```

## Best Practices

- **Test one variable at a time** - Change only one element between variants
- **Use clear variant names** - A, B, C for simple tests; A1, A2 for complex tests
- **Document your hypotheses** - Record what you're testing and why
- **Include analytics tracking** - Use the `{{variant}}` template in tracking configurations
- **Test meaningful changes** - Focus on elements that impact user behavior

---

**Last Updated**: February 11, 2026  
**Version**: 1.0.0