# AI Landing Page Wizard

Version: 1.0
Last updated: 2026-02-20
Status: Draft Design

## Purpose
The AI Landing Page Wizard is a development tool designed to automate the initial creation of marketing funnels by analyzing existing web pages and generating corresponding React components and JSON configurations for the Landing Page Engine.

## Workflow

### 1. Source Input
- **Action:** User enters a URL of an existing landing page.
- **Goal:** Identify the design language and structure to be replicated.

### 2. Intelligent Scraping (Dev Backend)
- **Tooling:** Node.js + Puppeteer or Playwright.
- **Requirement:** Must handle Single Page Applications (SPAs) by waiting for network idle and hydration.
- **Output:** 
  - Sanitized HTML (simplified DOM tree).
  - Computed styles (colors, fonts, spacing).
  - Extracted assets (images, logos).

### 3. AI Analysis (LLM)
- **Step:** Simplified HTML/Styles are sent to **gemma-3-27b-it**.
- **Tasks:**
  - **Section Decomposition:** Identify "Hero", "Value Proposition", "FAQ", "Testimonials", etc.
  - **Component Mapping:** Check if sections match existing components in `src/components/sections/`.
  - **Theming Extractor:** Map computed styles to `theme.json` tokens.

### 4. Implementation Selection
- **UI:** User sees a preview of the analyzed sections.
- **User Action:** Toggle implementation for each section. If a component is missing, user flags it for "New Component Generation".

### 5. Automated Code Generation
- **React Components:** For missing sections, the AI generates a `.tsx` file following the project's patterns (Tailwind, CSS Variables, Action Dispatcher).
- **Registry Update:** Automatically append new components to `src/registry/ComponentMap.ts`.
- **JSON Configuration:** Generate `theme.json`, `flow.json`, and layouts (`desktop.json`/`mobile.json`) in a new folder under `src/landings/`.

## Technical Requirements

### Dev-Only Backend
Since frontend JS cannot scrape URLs due to CORS and doesn't have filesystem access to write `.tsx`/`.json` files, a local Express server is required during development.

### LLM Context awareness
The generation prompts must include:
- `doc/design.md` for architectural rules.
- `docs/COMPONENTS.md` for existing component list.
- `src/schemas/` for valid JSON structures.

## 6. Minimal Dev Backend API (Simplified)

To keep implementation lightweight, the dev-only backend will provide the following endpoints:

- **POST `/api/dev/scrape`**: Receives a URL, uses Puppeteer to wait for hydration, and returns a JSON object containing the page title, primary colors (extracted from computed styles), and a list of identified DOM sections with their inner text/HTML snippets.
- **POST `/api/dev/analyze`**: Forwards the scraped data to **gemma-3-27b-it**. Returns a structured JSON mapping sections to engine components.
- **POST `/api/dev/generate`**: 
  - Writes new `.tsx` files to `src/components/sections/`.
  - Creates the new landing folder in `src/landings/`.
  - Appends imports to `src/registry/ComponentMap.ts`.

## Security & Constraints
- **Dev-Only:** The Wizard route/component and backend endpoints must be gated by `process.env.NODE_ENV === 'development'`.
- **Credential Hygiene:** API keys for LLM services must be stored in local `.env` files, never committed.
