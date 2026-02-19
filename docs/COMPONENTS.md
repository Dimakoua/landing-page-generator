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

## Loading States

All actionable elements (buttons, links, forms) in components automatically show loading indicators during action dispatch to provide immediate feedback for slow networks.

**Implementation:** Uses `useActionDispatch` hook for consistent loading state management across components.

**Visual Feedback:**
- Buttons are disabled and show reduced opacity
- Icons are replaced with spinning refresh indicators
- Text may change to "Loading..." or show spinner next to label

**Example Usage:**
```tsx
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';

function MyComponent({ dispatcher, actions }) {
  const { loading, dispatchWithLoading } = useActionDispatch(dispatcher);

  const handleClick = () => {
    dispatchWithLoading('myAction', actions.myAction);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading.myAction}
      className={`btn ${loading.myAction ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading.myAction ? (
        <span className="material-icons animate-spin">refresh</span>
      ) : (
        'Click Me'
      )}
    </button>
  );
}
```

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

### LoadFromApi
**Unique Component** — Loads dynamic layout sections from a remote API endpoint at runtime. This enables personalization, A/B testing, and content management integration without rebuilding the site.

**Key Features:**
- Fetches JSON layout (sections array) from API
- Supports caching with TTL (time-to-live) control
- Automatic error handling and retry logic
- Loading/error state indicators
- Conditional success/error actions
- Multiple HTTP methods (GET, POST, PUT, DELETE)
- Custom cache keys for granular control

**Props:**
- `endpoint` (required, string) — API URL to fetch layout from
- `method` (string, default: "GET") — HTTP method (GET, POST, PUT, DELETE)
- `payload` (object, optional) — JSON data to send (for POST/PUT requests)
- `headers` (object, optional) — Custom headers (e.g., authentication)
- `cacheEnabled` (boolean, default: true) — Enable client-side caching
- `cacheKey` (string, optional) — Custom cache key; defaults to endpoint URL
- `ttl` (number, optional) — Cache TTL in milliseconds (default: 300000 = 5 min)
- `timeout` (number, optional) — Request timeout in milliseconds (default: 10000)

**Actions:**
- `onSuccess` — Triggered when content loads successfully (optional)
- `onError` — Triggered when fetch fails or validation fails (optional)

**Expected API Response:**
```json
{
  "sections": [
    {
      "component": "Hero",
      "props": { "title": "Dynamic Title" }
    },
    {
      "component": "Products",
      "props": { "products": [] }
    }
  ]
}
```

**Example Layout Usage:**
```json
{
  "sections": [
    {
      "component": "Navigation"
    },
    {
      "component": "LoadFromApi",
      "props": {
        "endpoint": "https://api.example.com/landing-content",
        "method": "GET",
        "cacheEnabled": true,
        "cacheKey": "landing_sections",
        "ttl": 600000
      },
      "actions": {
        "onSuccess": {
          "type": "analytics",
          "event": "content_loaded"
        },
        "onError": {
          "type": "chain",
          "actions": [
            {
              "type": "log",
              "message": "Failed to load dynamic content",
              "level": "error"
            },
            {
              "type": "navigate",
              "url": "/fallback"
            }
          ]
        }
      }
    },
    {
      "component": "Footer"
    }
  ]
}
```

**Use Cases:**
1. **Personalization** — Fetch different layouts per user segment
2. **A/B Testing** — Load variant layouts from CMS without rebuilding
3. **Dynamic Content** — Pull latest blog posts, products, or testimonials
4. **Headless CMS** — Integrate with Contentful, Strapi, or custom API
5. **Real-time Updates** — Show current inventory, pricing, or promotions

**Caching Strategy:**
- First request: Fetches from API and caches locally
- Subsequent requests (while cache valid): Uses cached data, no API call
- Cache expires: Automatic refresh on next request
- Custom `cacheKey`: Group multiple endpoints under one cache entry
- `cacheEnabled: false`: Always fetch fresh (no caching)

**Example with Personalization:**
```json
{
  "component": "LoadFromApi",
  "props": {
    "endpoint": "https://api.example.com/personalized-content?user={{state.userId}}",
    "method": "GET",
    "cacheEnabled": true,
    "cacheKey": "user_{{state.userId}}_content",
    "ttl": 300000
  }
}
```

**Error Handling:**
- Network errors → `onError` action + fallback UI displayed
- Invalid response format → `onError` action
- Timeout → Retried automatically (up to 3 times)
- Missing required fields → Component shows error state

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
