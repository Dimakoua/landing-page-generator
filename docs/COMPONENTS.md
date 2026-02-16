# Components Reference

Quick reference for all available UI components.

---

## Overview

Components are React building blocks that render page sections. They're automatically discovered from `src/components/` and registered — just add a `.tsx` file and use it in your layouts.

**All components receive:**
- `dispatcher` — ActionDispatcher instance for triggering actions
- `actions` — Named actions defined in your layout
- `state` — Global application state

---

## Core Components

### Hero
Marketing headline section with image gallery and CTAs.

**Props:** `title`, `subtitle`, `description`, `badge`, `backgroundImage`, `backgroundVideo`, `images[]`, `price`, `originalPrice`, `colors[]`  
**Actions:** `primary`, `secondary`

---

### Navigation
Sticky header with logo and menu items.

**Props:** `logo`, `menuItems[]`, `cartIcon`  
**Actions:** Set on menu items and logo

---

### TwoColumnSection
Two-column layout (text + image).

**Props:** `title`, `subtitle`, `content`, `image`, `imagePosition` (left/right)  
**Actions:** On buttons and CTAs

---

### TwoColumnGrid
2-column responsive grid.

**Props:** `columns[]` (each with title, content, image)  
**Actions:** Per column

---

### Testimonials
Social proof section with grid/carousel modes.

**Props:** `title`, `subtitle`, `testimonials[]` (name, role, company, content, image, rating), `displayMode` (grid/carousel/single), `itemsPerRow`

---

### Accordion
Collapsible sections for FAQs or specs.

**Props:** `items[]` (title, content, icon), `allowMultiple`, `defaultOpen`  
**Actions:** Per item

---

### Products / RecommendedProducts
Product showcase with cards.

**Props:** `title`, `products[]` (title, price, image, description)  
**Actions:** Add to cart, view details

---

### CheckoutForm
Multi-field form for customer data.

**Props:** `title`, `fields[]` (name, label, type, required, placeholder, mask), `submitButton`  
**Actions:** On form submission

---

### Confirmation
Thank you / order confirmation page.

**Props:** `title`, `message`, `orderNumber`, `details[]`

---

### Footer
Page footer with links and info.

**Props:** `logo`, `navLinks[]`, `socialLinks[]`, `copyright`

---

### GridSection
Flexible grid layout.

**Props:** `title`, `items[]` (title, content, image, icon), `columns` (1-4)

---

### HeatmapRecorder
Background tracker for user behavior (invisible).

**Props:** `analyticsProvider` (custom/google_analytics), `endpoint`, `sampleRate` (0-1)

---

### FetchFromApi
Load dynamic content from an API.

**Props:** `url`, `method` (GET/POST), `payload`, `transform`, `fallback`  
**Actions:** On data load/error

---

### Forms
Generic form wrapper.

**Props:** `fields[]`, `layout` (horizontal/vertical), `submitButton`

---

### CustomerServiceSection
Support/contact module.

**Props:** `title`, `subtitle`, `contactMethods[]`, `form`

---

## Adding Custom Components

1. Create a directory in `src/components/` (e.g., `MyCustom/`)
2. Add a `.tsx` file exporting a default React component
3. Use it immediately in layouts: `"component": "MyCustom"`

**Example:**
```tsx
// src/components/MyCustom/MyCustom.tsx
export default function MyCustom({ title, dispatcher, actions }) {
  return <div>{title}</div>;
}
```

---

## Component Registration

Components are auto-discovered and lazy-loaded. The registry key comes from your filename (case-sensitive):

- `Hero.tsx` → `"component": "Hero"`
- `MyComponent.tsx` → `"component": "MyComponent"`

---

## See Also

- [Layouts](LAYOUTS.md) — How to compose components
- [Action Dispatcher](ACTION_DISPATCHER.md) — Making components interactive
- [Getting Started](GETTING_STARTED.md) — Building blocks overview
