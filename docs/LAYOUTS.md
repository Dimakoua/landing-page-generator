# Layouts

Define page structure by composing components into sections.

---

## Overview

Layouts define what appears on each page step. Create separate `desktop.json` and `mobile.json` files for responsive design.

```
steps/
├── home/
│   ├── desktop.json
│   └── mobile.json
├── checkout/
│   ├── desktop.json
│   └── mobile.json
└── ...
```

---

## Basic Layout

```json
{
  "sections": [
    {
      "component": "Navigation",
      "props": { "logo": "My Brand" }
    },
    {
      "component": "Hero",
      "props": {
        "title": "Welcome",
        "subtitle": "Change your life today"
      },
      "actions": {
        "primary": {
          "type": "navigate",
          "url": "/checkout"
        }
      }
    },
    {
      "component": "TwoColumnSection",
      "props": {
        "title": "Why Us",
        "content": "We're the best"
      }
    }
  ]
}
```

---

## Section Structure

Each section renders one component:

```json
{
  "component": "HeroName",
  "props": {
    "title": "Your Title",
    "subtitle": "Your Subtitle"
  },
  "actions": {
    "approve": { ... },
    "reject": { ... }
  }
}
```

**Properties:**
- `component` (required) — Component name, must be registered
- `props` (optional) — Props to pass to component
- `actions` (optional) — Named actions for user interactions

---

## Actions in Layouts

Actions handle user interactions. Define them in the `actions` object of a section.

```json
{
  "component": "Hero",
  "props": { "title": "Click Me" },
  "actions": {
    "primary": {
      "type": "navigate",
      "url": "/next-page"
    },
    "secondary": {
      "type": "redirect",
      "url": "https://example.com"
    }
  }
}
```

Common action names:
- `approve` — Primary positive (Yes, Continue, Buy)
- `reject` — Primary negative (No, Cancel, Skip)
- `primary` — Main CTA
- `secondary` — Alternative CTA
- Custom names work too

---

## Conditional Rendering

Conditionally show or hide sections based on state or user agent. Use the declarative `condition` property on any section to control visibility at render time.

**Supported Condition Types:**
- `stateEquals` — State value equals expected value
- `stateExists` — State key is defined (not undefined)
- `stateMatches` — State value matches regex pattern
- `userAgentMatches` — User agent matches regex pattern
- `userAgentIncludes` — User agent contains substring (case-insensitive)
- `custom` — Reserved for future custom conditions

### Basic Example: Show Premium Features

```json
{
  "state": { "userTier": "premium" },
  "sections": [
    {
      "component": "Hero",
      "props": { "title": "Welcome" }
    },
    {
      "component": "PremiumFeatures",
      "props": { "title": "Exclusive Features" },
      "condition": {
        "condition": "stateEquals",
        "key": "userTier",
        "value": "premium"
      }
    },
    {
      "component": "UpgradePrompt",
      "props": { "title": "Upgrade to Premium" },
      "condition": {
        "condition": "stateEquals",
        "key": "userTier",
        "value": "free"
      }
    }
  ]
}
```

### Example: Show Mobile-Only Content

```json
{
  "sections": [
    {
      "component": "DesktopFeatures",
      "props": { "layout": "grid" },
      "condition": {
        "condition": "userAgentMatches",
        "pattern": "Windows|Macintosh|Linux",
        "flags": "i"
      }
    },
    {
      "component": "MobileMenu",
      "props": { "style": "hamburger" },
      "condition": {
        "condition": "userAgentMatches",
        "pattern": "iPhone|Android|Mobile",
        "flags": "i"
      }
    }
  ]
}
```

### Example: Show Content Based on State Existence

```json
{
  "sections": [
    {
      "component": "GuestHero",
      "props": { "title": "Welcome Guest" },
      "condition": {
        "condition": "stateMatches",
        "key": "user",
        "pattern": "^undefined$"
      }
    },
    {
      "component": "UserDashboard",
      "props": { "title": "Welcome Back" },
      "condition": {
        "condition": "stateExists",
        "key": "user"
      }
    }
  ]
}
```

### Example: Multi-Step Checkout with Conditional Sections

```json
{
  "state": {
    "step": 1,
    "cartItems": 0
  },
  "sections": [
    {
      "component": "Navigation"
    },
    {
      "component": "CartSummary",
      "condition": {
        "condition": "stateMatches",
        "key": "cartItems",
        "pattern": "[1-9]"
      }
    },
    {
      "component": "ShippingForm",
      "condition": {
        "condition": "stateEquals",
        "key": "step",
        "value": 1
      }
    },
    {
      "component": "PaymentForm",
      "condition": {
        "condition": "stateEquals",
        "key": "step",
        "value": 2
      }
    },
    {
      "component": "OrderConfirmation",
      "condition": {
        "condition": "stateEquals",
        "key": "step",
        "value": 3
      }
    },
    {
      "component": "EmptyCartPrompt",
      "condition": {
        "condition": "stateEquals",
        "key": "cartItems",
        "value": 0
      }
    },
    {
      "component": "Footer"
    }
  ]
}
```

### Condition Properties

```json
{
  "condition": "stateEquals",
  "key": "fieldName",
  "value": "expectedValue",
  "pattern": "regex",
  "flags": "i"
}
```

- **`condition`** (required) — Type of condition (see supported types above)
- **`key`** (required for state conditions) — State key to evaluate
- **`value`** (optional) — Expected value for `stateEquals`
- **`pattern`** (optional) — Regex pattern for `stateMatches` or `userAgentMatches`
- **`flags`** (optional) — Regex flags like `"i"` for case-insensitive

### Use Cases

**1. A/B Testing Variants:**
```json
{
  "condition": "stateEquals",
  "key": "variant",
  "value": "A"
}
```

**2. Progressive Disclosure:**
```json
{
  "condition": "stateExists",
  "key": "userEmail"
}
```

**3. Device Detection:**
```json
{
  "condition": "userAgentIncludes",
  "value": "Mobile"
}
```

**4. Complex Matching:**
```json
{
  "condition": "stateMatches",
  "key": "email",
  "pattern": "^[a-zA-Z0-9._%+-]+@company\\.com$"
}
```

### Best Practices

- **Keep logic simple** — Use simple conditions in JSON; complex logic belongs in actions/state management
- **Fail open** — If condition evaluates with an error, section renders anyway (logged at debug level)
- **Use state for control** — Update state via `setState` action to control section visibility
- **Combine with actions** — Use conditional sections + actions for powerful flows

---

## Composing Pages

Common action names:
- `approve` — Primary positive (Yes, Continue, Buy)
- `reject` — Primary negative (No, Cancel, Skip)
- `primary` — Main CTA
- `secondary` — Alternative CTA
- Custom names work too

### Simple Page
```json
{
  "sections": [
    { "component": "Hero", "props": { "title": "Hello" } },
    { "component": "Footer", "props": { "copyright": "© 2025" } }
  ]
}
```

### Multi-Section Page
```json
{
  "sections": [
    { "component": "Navigation" },
    { "component": "Hero" },
    { "component": "TwoColumnSection" },
    { "component": "Testimonials" },
    { "component": "CheckoutForm" },
    { "component": "Footer" }
  ]
}
```

### Chaining Multiple Actions
```json
{
  "sections": [
    {
      "component": "Accordion",
      "props": {
        "items": [
          { "title": "What is this?", "content": "..." },
          { "title": "How does it work?", "content": "..." }
        ]
      }
    },
    {
      "component": "Hero",
      "props": { "title": "Ready to start?" },
      "actions": {
        "primary": {
          "type": "chain",
          "actions": [
            { "type": "analytics", "event": "signup_clicked" },
            { "type": "navigate", "url": "/signup" }
          ]
        }
      }
    }
  ]
}
```

This runs analytics tracking first, then navigates to the signup page. Use `chain` to sequence actions in order.

---

## Responsive Design

Create separate layouts for desktop and mobile to optimize UX for each device. The engine automatically loads `desktop.json` or `mobile.json` based on screen size.

### Example: Product Showcase

**desktop.json** — Show full layout with multiple columns:
```json
{
  "sections": [
    {
      "component": "TwoColumnSection",
      "props": {
        "title": "Why Our Product?",
        "content": "We offer the best features available.",
        "image": "https://example.com/features-wide.jpg",
        "imagePosition": "right"
      }
    },
    {
      "component": "TwoColumnGrid",
      "props": {
        "items": [
          { "title": "Fast", "content": "5x faster than competitors" },
          { "title": "Secure", "content": "Bank-level encryption" },
          { "title": "Affordable", "content": "50% less than others" },
          { "title": "Reliable", "content": "99.9% uptime SLA" }
        ]
      }
    },
    {
      "component": "Testimonials",
      "props": {
        "displayMode": "grid",
        "itemsPerRow": 3
      }
    }
  ]
}
```

**mobile.json** — Simplify for smaller screens:
```json
{
  "sections": [
    {
      "component": "Hero",
      "props": {
        "title": "Why Our Product?",
        "subtitle": "We offer the best features available.",
        "backgroundImage": "https://example.com/features-mobile.jpg"
      }
    },
    {
      "component": "Accordion",
      "props": {
        "items": [
          { "title": "Fast", "content": "5x faster than competitors" },
          { "title": "Secure", "content": "Bank-level encryption" },
          { "title": "Affordable", "content": "50% less than others" },
          { "title": "Reliable", "content": "99.9% uptime SLA" }
        ]
      }
    },
    {
      "component": "Testimonials",
      "props": {
        "displayMode": "carousel",
        "itemsPerRow": 1
      }
    }
  ]
}
```

### Key Differences

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| **Layout** | Multi-column grids | Single column, stacked |
| **Images** | High-res, large | Optimized, smaller |
| **Text** | Longer paragraphs | Short, scannable |
| **Components** | Grid, TwoColumn | Accordion, Carousel |
| **Navigation** | Horizontal menu | Hamburger, simplified |
| **Forms** | Full-width, all fields | Single column, essential fields |
| **CTAs** | Multiple options | One primary CTA per section |

### Best Practices

- **Keep content identical** but restructure for readability
- **Use appropriate components** (grids for desktop, carousels for mobile)
- **Optimize images** — smaller file sizes for mobile
- **Stack sections vertically** on mobile to avoid scrolling horizontally
- **Increase touch targets** — buttons/links larger on mobile
- **Hide secondary info** on mobile (move to accordion/tabs)

---

## Component Props

All components receive:
- **User-defined props** from layout
- **`dispatcher`** — ActionDispatcher instance
- **`actions`** — Named actions object
- **`state`** — Global state

---

## Available Components

See [Components Reference](COMPONENTS.md) for full list with props for each component.

Common ones:
- **Hero** — Main headline/banner
- **Navigation** — Header with menu
- **TwoColumnSection / TwoColumnGrid** — Multi-column layouts
- **Testimonials** — Social proof
- **Accordion** — FAQs
- **CheckoutForm** — Customer form
- **Products** — Product showcase
- **Confirmation** — Thank you page
- **Footer** — Bottom section

---

## Actions Reference

For complete action types and examples, see [Action Dispatcher](ACTION_DISPATCHER.md).

Quick reference:
- `navigate` — Go to another step
- `redirect` — Go to external URL
- `post/get/put/patch/delete` — API calls
- `analytics` — Track events
- `chain` — Run multiple actions

---

## See Also

- [Components](COMPONENTS.md) — Component reference
- [Action Dispatcher](ACTION_DISPATCHER.md) — All action types
- [Getting Started](GETTING_STARTED.md) — Building pages step-by-step
