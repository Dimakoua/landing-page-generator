# Components Documentation

## Overview

Components are the building blocks of your landing pages. The system provides a rich set of production-ready React components that are automatically registered and can be used in layouts.

## Component Architecture

### Automatic Registration

Components are automatically discovered from the `src/components` directory. Any `.tsx` file that is a default export will be registered in the `ComponentMap`.

- **Key generation**: The file path is used to determine the key (e.g., `src/components/hero/Hero.tsx` -> `Hero`).
- **Lazy loading**: All components are lazy-loaded to minimize the initial bundle size.

### Component Interface

All components receive these standard props automatically:

- **`dispatcher`**: The `ActionDispatcher` instance for triggering actions.
- **`actions`**: A map of named actions defined in the layout.
- **`state`**: The current global state of the engine.

## Core Components

### 1. Hero (`Hero.tsx`)
A versatile header section that supports both brand marketing and e-commerce product displays.

**Props:**
- `title`, `subtitle`, `description`: Content strings.
- `badge`: Small label above the title.
- `backgroundImage`, `backgroundVideo`: Visual backgrounds.
- `images`: Array of `{ src, alt }` for product gallery.
- `price`, `originalPrice`: Product pricing info.
- `colors`: Array of `{ id, label, color }` for variants.
- `primaryButton`, `secondaryButton`: Objects with `{ label, onClick: Action }`.

**Actions:**
- `primary`: Triggered by primary button.
- `secondary`: Triggered by secondary button.

---

### 2. Navigation (`Navigation.tsx`)
Sticky header with logo, dynamic menu items, and optional cart.

**Props:**
- `logo`: `{ text, image, onClick: Action }`.
- `menuItems`: Array of `{ label, action: Action }`.
- `cartIcon`: `{ itemCount, action: Action }`.

---

### 3. Testimonials (`Testimonials.tsx`)
Social proof section with grid or carousel layouts.

**Props:**
- `title`, `subtitle`: Header content.
- `testimonials`: Array of `{ name, role, company, content, image, rating }`.
- `displayMode`: `"grid"` | `"carousel"` | `"single"`.
- `itemsPerRow`: Number of items in grid (1-4).

---

### 4. CheckoutForm (`CheckoutForm.tsx`)
Dynamic form for gathering customer information. Links to global state for data persistence.

**Props:**
- `title`: Form title.
- `form`: `{ id, fields: [...], submitButton: { label, onClick: Action } }`.
- `fields`: Array of `{ name, label, type, required, validator, mask, placeholder }`.

---

### 5. Accordion (`Accordion.tsx`)
Collapsible sections for FAQs or product specifications. Supports plain text or spec lists.

**Props:**
- `items`: Array of `{ title, content, icon, action: Action }`.
- `allowMultiple`: Boolean to allow multiple sections open.
- `defaultOpen`: ID or array of IDs of items to open by default.

---

### 6. RecommendedProducts (`RecommendedProducts.tsx`)
Horizontal scrolling list of product cards with integrated CTA actions.

**Props:**
- `title`: Section title.
- `products`: Array of `{ title, price, image, cta: { label, onClick: Action } }`.

---

### 7. HeatmapRecorder (`HeatmapRecorder.tsx`)
Background component for tracking user clicks and generating heatmaps.

**Props:**
- `analyticsProvider`: `"custom"` | `"google_analytics"`.
- `endpoint`: API URL for custom provider.
- `sampleRate`: 0 to 1 (probability of recording a session).

## Adding New Components

1. Create a new directory in `src/components/`.
2. Add your `.tsx` file (e.g., `ValueProp.tsx`).
3. Export your component as `default`.
4. It will be immediately available in layouts as `"component": "ValueProp"`.

## Troubleshooting

### Component Not Found
- Check the file name matches exactly (case-sensitive).
- Verify the component is exported as `default`.
- Check the browser console for registration warnings.

### Props Not Working
- Ensure props match the component's interface.
- Verify JSON values are correctly typed (numbers vs strings).

### Actions Not Firing
- Confirm `onClick` or `action` props are correctly linked in layout JSON.
- Verify action type is supported.
