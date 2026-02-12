# Getting Started: Landing Page Factory

Welcome to the Landing Page Factory! This guide will help you and your team create, customize, and launch new landing pages rapidly using the JSON-driven, component-based architecture.

---

## 1. Project Overview
- **Declarative JSON configs**: Define content, layout, and flows without code
- **Component-based engine**: 20+ production-ready React components
- **Action system**: 15+ action types for interactivity (navigate, API, analytics, etc.)
- **A/B testing**: Built-in support for variants
- **Theme system**: Brand customization via CSS variables

---

## 2. Prerequisites
- Node.js v18+
- npm v9+
- VS Code (recommended)
- Git (for version control)

---

## 3. Local Setup
```bash
# Clone the repo
 git clone <your-repo-url>
 cd lp_factory

# Install dependencies
 npm install

# Start the dev server
 npm run dev

# Open http://localhost:5173 in your browser
```

---

## 4. Project Structure
```
landings/
  _template/         # Starter for new pages
  sample/            # Example landing page
    flow.json        # Step sequence
    theme.json       # Colors, fonts
    steps/
      hero/
        desktop.json # Desktop layout for hero step
        mobile.json  # Mobile layout for hero step
components/sections/ # All available UI components
schemas/             # JSON schemas for validation
```

---

## 5. Creating a New Landing Page
1. **Copy the template**
   ```bash
   cp -r src/landings/_template src/landings/my-new-page
   ```
2. **Edit `theme.json`**
   - Set brand colors and fonts
3. **Edit `flow.json`**
   - Define the ordered steps (e.g., hero, form, pricing)
4. **Edit step layouts**
   - For each step, edit `desktop.json` and `mobile.json`
   - Add/remove sections (components) as needed
5. **Reference components**
   - Use any component from `src/registry/ComponentMap.ts`
   - Set `props` and `actions` for each section
6. **Preview your page**
   - Save changes and refresh the browser

---

## 6. JSON Editing Tips
- **Autocomplete & validation**: Enabled in VS Code via `.vscode/settings.json`
- **Component names**: Must match keys in `ComponentMap.ts`
- **Action types**: See `schemas/layout.schema.json` for supported actions
- **Props**: Refer to `COMPONENTS.md` for available props per component

---

## 7. A/B Testing
- Add variants by duplicating step/layout files (e.g., `hero/desktop-B.json`)
- Update `flow.json` to reference variant steps
- Use URL params or random assignment for variant selection

---

## 8. Running Tests
```bash
npm run test:run
```
- 206+ tests cover actions and engine logic
- See coverage reports for details

---

## 9. Deployment
- Build for production:
  ```bash
  npm run build
  ```
- Deploy the `dist/` folder to your static hosting provider

---

## 10. Resources
- [COMPONENTS.md](COMPONENTS.md): Component catalog & props
- [ACTION_DISPATCHER.md](ACTION_DISPATCHER.md): Action system reference
- [FLOWS.md](FLOWS.md): Flow and step design
- [THEMES.md](THEMES.md): Theming guide
- [recomendations.md](../recomendations.md): Architectural analysis & roadmap

---

## 11. Need Help?
See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.
