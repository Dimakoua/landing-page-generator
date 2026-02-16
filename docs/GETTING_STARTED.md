# Getting Started: Landing Page Factory

Learn how to create, customize, and deploy landing pages using JSON-driven configurations.

---

## 1. Prerequisites

- Node.js v18+
- npm v9+

---

## 2. Installation & Setup

```bash
# Clone and install
git clone <repo-url>
cd landing-page-factory
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 3. Creating Your First Landing Page

### Option A: Using the Scaffold Script (Recommended)

```bash
npm run scaffold my-awesome-page
```

This creates a complete landing page structure in `src/landings/my-awesome-page/`.

### Option B: Copy the Template

```bash
cp -r src/landings/_template src/landings/my-awesome-page
```

---

## 4. Directory Structure

Every landing page has this structure:

```
src/landings/my-awesome-page/
├── theme.json              # Colors, fonts, spacing
├── flow.json               # Steps and metadata
└── steps/
    ├── home/
    │   ├── desktop.json    # Desktop layout
    │   └── mobile.json     # Mobile layout
    ├── features/
    │   ├── desktop.json
    │   └── mobile.json
    └── checkout/
        ├── desktop.json
        └── mobile.json
```

---

## 5. Core Concepts at a Glance

### Theme (`theme.json`)
Define your brand's visual identity: colors, fonts, spacing, and border radius.

```json
{
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "background": "#ffffff",
    "text": "#1e293b"
  },
  "fonts": {
    "body": "Inter, sans-serif",
    "heading": "Outfit, sans-serif"
  },
  "spacing": {
    "section": "5rem",
    "gap": "1rem"
  }
}
```

[Learn more →](THEMES.md)

### Flow (`flow.json`)
Define your user journey as a sequence of steps.

```json
{
  "seo": {
    "title": "My Landing Page",
    "description": "Create amazing landing pages"
  },
  "steps": [
    { "id": "home", "type": "normal" },
    { "id": "features", "type": "normal" },
    { "id": "checkout", "type": "normal" }
  ]
}
```

[Learn more →](FLOWS.md)

### Layout (`steps/[id]/desktop.json`)
Compose pages from components. Create separate mobile and desktop layouts.

```json
{
  "sections": [
    {
      "component": "Hero",
      "props": {
        "title": "Welcome",
        "subtitle": "Start your journey today"
      },
      "actions": {
        "primary": {
          "type": "navigate",
          "url": "/features"
        }
      }
    },
    {
      "component": "TwoColumnSection",
      "props": {
        "title": "Why Choose Us",
        "content": "We offer the best service"
      }
    }
  ]
}
```

[Learn more →](LAYOUTS.md)

---

## 6. Building Your Page: Step by Step

### Step 1: Customize the Theme
Edit `theme.json` to match your brand colors and fonts.

### Step 2: Define Your Flow
Edit `flow.json` to add all page steps you need.

### Step 3: Create Layouts
For each step, edit `steps/[id]/desktop.json` and `steps/[id]/mobile.json`:

```json
{
  "sections": [
    { "component": "Navigation", "props": { "logo": "My Brand" } },
    { "component": "Hero", "props": { "title": "Welcome" } }
  ]
}
```

### Step 4: Add Interactions
Add actions to components to handle user clicks:

```json
{
  "component": "Hero",
  "props": { "title": "Sign Up" },
  "actions": {
    "primary": {
      "type": "post",
      "url": "https://api.example.com/leads",
      "payload": { "email": "user@example.com" }
    }
  }
}
```

[All action types →](ACTION_DISPATCHER.md)

### Step 5: Preview
Your page is live at `http://localhost:5173/my-awesome-page` as you edit.

---

## 7. Available Components

| Component | Purpose |
|-----------|---------|
| Hero | Hero banner with text and images |
| Navigation | Sticky header with menu |
| TwoColumnSection | Two-column layout |
| TwoColumnGrid | Grid-based layout |
| Testimonials | Social proof section |
| Accordion | Collapsible FAQ/specs |
| Products / RecommendedProducts | Product showcase |
| CheckoutForm | Customer information form |
| Confirmation | Thank you / confirmation page |
| Footer | Footer section |
| GridSection | Responsive grid |
| HeatmapRecorder | User behavior tracking |
| CustomHTML | Render custom HTML |
| FetchFromApi | Load data from API |

[Component reference →](COMPONENTS.md)

---

## 8. Actions (User Interactions)

Examples of common actions:

```json
// Navigate to another step
{ "type": "navigate", "url": "/checkout" }

// Redirect to external URL
{ "type": "redirect", "url": "https://example.com", "target": "_blank" }

// Send data to API
{
  "type": "post",
  "url": "https://api.example.com/leads",
  "payload": { "email": "user@email.com" }
}

// Track analytics event
{ "type": "analytics", "event": "button_clicked" }

// Chain multiple actions
{
  "type": "chain",
  "actions": [
    { "type": "analytics", "event": "signup" },
    { "type": "navigate", "url": "/thanks" }
  ]
}
```

[Complete action reference →](ACTION_DISPATCHER.md)

---

## 9. A/B Testing

Create variants by adding letter suffixes to filenames:

```
flow-A.json      # Variant A
flow-B.json      # Variant B
theme-A.json     # Variant A
theme-B.json     # Variant B
desktop-A.json   # Variant A
desktop-B.json   # Variant B
```

[A/B Testing guide →](AB_TESTING.md)

---

## 10. Development Commands

```bash
npm run dev               # Start dev server (hot reload)
npm run build            # Production build
npm run lint             # Check code quality
npm run test:run         # Run unit tests
npm run test:coverage    # Code coverage report
npm run scaffold <name>  # Create new landing
```

---

## 11. Next Steps

- **Explore Components** → [Component Reference](COMPONENTS.md)
- **Master Actions** → [Action Dispatcher Guide](ACTION_DISPATCHER.md)
- **Design with Themes** → [Themes Documentation](THEMES.md)
- **Build complex flows** → [Flows Documentation](FLOWS.md)
- **Troubleshoot issues** → [Troubleshooting Guide](TROUBLESHOOTING.md)

---

## 12. Key Files Reference

| File | Purpose |
|------|---------|
| `src/landings/` | All landing page configs |
| `src/components/` | React components (auto-registered) |
| `src/engine/ActionDispatcher.ts` | Action execution system |
| `src/registry/ComponentMap.ts` | Component registry |
| `vite.config.ts` | Build configuration |
