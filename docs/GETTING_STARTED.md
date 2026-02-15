# Getting Started: Landing Page Factory

Welcome to the Landing Page Factory! This guide will help you create, customize, and launch new landing pages rapidly using our JSON-driven architecture.

---

## 1. Project Overview
The engine transforms declarative JSON configurations into high-performance landing pages:
- **Zero-Code Workflows**: Define content and behavior in JSON.
- **Auto-Registering Components**: Drop a `.tsx` file into `src/components` and use it immediately.
- **Centralized Actions**: Powerful interaction system for lead capture and tracking.

---

## 2. Prerequisites
- Node.js v18+
- npm v9+

---

## 3. Local Setup
```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

---

## 4. Creating a New Landing Page
The fastest way to start is using the scaffold script or copying the template:

### Method A: Scaffold Script (Recommended)
```bash
node scripts/scaffold.js my-new-page
```

### Method B: Manual Copy
1. Copy `src/landings/_template` to `src/landings/my-page`.
2. Edit `theme.json` to set your brand colors.
3. Edit `flow.json` to define your steps.
4. Customize step layouts in `steps/[id]/desktop.json`.

---

## 5. Key Documentation
For detailed information on specific topics, see:
- [**Component Catalog**](COMPONENTS.md)
- [**Action System**](ACTION_DISPATCHER.md)
- [**Themes & Branding**](THEMES.md)
- [**FAQ & Troubleshooting**](TROUBLESHOOTING.md)

---

## 6. Resources
- [Full Documentation Index](README.md)
