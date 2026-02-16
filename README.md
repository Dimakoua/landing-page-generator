# Landing Page Factory

A JSON-driven landing page generator built with React, TypeScript, and Vite. Create dynamic, data-driven landing pages by composing reusable components with declarative configurations—no complex coding needed.

## ✨ Key Features

- **🚀 Component-Based**: Reusable React components auto-discovered from `src/components`
- **📝 JSON-Driven**: Define content, styling, and behavior entirely in JSON
- **🎨 CSS Custom Properties**: Centralized theming system for consistent visuals
- **📱 Responsive Layouts**: Separate mobile and desktop layouts for optimal UX
- **🔄 Multi-Step Flows**: Create user journeys with conditional navigation
- **⚡ Action System**: Declarative actions for API calls, analytics, navigation, and more
- **🧪 A/B Testing**: Built-in variant support for testing and optimization

## 📚 Documentation

Start with the **[docs/](docs/)** folder:

| Guide | Purpose |
|-------|---------|
| [Getting Started](docs/GETTING_STARTED.md) | Setup, creating first landing, core concepts |
| [Themes](docs/THEMES.md) | Visual styling, colors, fonts, spacing |
| [Flows](docs/FLOWS.md) | User journey structure and step management |
| [Layouts](docs/LAYOUTS.md) | Page composition and component placement |
| [Components](docs/COMPONENTS.md) | Available UI components and their props |
| [Action Dispatcher](docs/ACTION_DISPATCHER.md) | User interactions, API calls, analytics, workflows |
| [A/B Testing](docs/AB_TESTING.md) | Creating variants and testing strategies |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and solutions |

## ⚡ Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see your first landing page.

**Creating your first page?** → See [Getting Started](docs/GETTING_STARTED.md)

## 🎯 How It Works

1. **Define**: Write `flow.json` (steps), `theme.json` (style), and `desktop.json`/`mobile.json` (layout)
2. **Compose**: Use built-in components in your layout files
3. **Interact**: Add actions to components for navigation, APIs, analytics
4. **Preview**: Dev server hot-reloads as you edit JSON

**Example core structure:**
```
src/landings/my-page/
├── theme.json          # Colors, fonts, spacing
├── flow.json           # Step definitions and SEO
└── steps/
    ├── home/
    │   ├── desktop.json
    │   └── mobile.json
    └── checkout/
        ├── desktop.json
        └── mobile.json
```

## 🛠️ Development

```bash
npm run dev              # Start dev server (port 5173)
npm run build            # Production build
npm run lint             # ESLint check
npm run test:run         # Run tests
npm run test:coverage    # Coverage report
npm run scaffold <name>  # Create new landing from template
npm run storybook        # Start Storybook (component explorer) on http://localhost:6006
npm run build-storybook  # Build static Storybook (output: storybook-static)
```

## 📦 Storybook

View and interact with the component library (stories live under `src/components`). Use Storybook to:

- Inspect components and visual states interactively ✅
- Test UI variations used by JSON-driven layouts ✅
- Add or update stories alongside component code (create `*.stories.tsx` files)

Quick commands:

```bash
npm run storybook       # start Storybook (dev server)
npm run build-storybook # produce static Storybook build
```

Stories location: `src/components/**/*/*.stories.*`

> Tip: add a `*.stories.tsx` next to a component to document usage and visual states.

## 📄 License

Commercial use allowed with attribution. See [LICENSE](LICENSE) for terms.

---

Built with React, TypeScript, Vite, and Tailwind CSS.