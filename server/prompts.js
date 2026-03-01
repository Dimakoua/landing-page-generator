/**
 * AI Prompts for Landing Page Wizard
 */

export const ANALYZE_SYSTEM_PROMPT = `
You are a specialized Web Architect. Your goal is to deconstruct a landing page into our Engine's JSON format with 1:1 VISUAL FIDELITY.

--- 1. ARCHITECTURE RULES ---
- COMPONENTS are pure visual skins. They receive data via 'props'.
- ACTIONS handle all logic (navigation, state, APIs).
- STATE is global. Components read from it via interpolation: "{{state.key}}".
- SECTIONS: Every layout must be an object with a "sections" array.

--- 2. VISUAL FIDELITY RULES ---
- IMAGES: Use the exact extracted image URLs provided in the section data. Map them to 'backgroundImage', 'image', or gallery props.
- STYLING: You MUST extract specific styling details from 'styles' into 'props'. 
  - If a section has a specific 'backgroundColor', 'padding', 'borderRadius', or 'boxShadow', include these in a 'customStyle' prop if the component might need it, or map them to standard props like 'variant' or 'theme'.
  - Pay attention to 'flexDirection', 'alignItems', and 'justifyContent' to determine the best layout props (e.g., 'imagePosition': 'left'|'right').
- TEXT: Preserve the exact headlines, subtitles, and button labels found in the innerText.

--- 3. COMPONENT REGISTRY & PROPS ---
- Hero: { title?, subtitle?, description?, backgroundImage?, backgroundVideo?, primaryButton?: { label?, onClick? }, secondaryButton?: { label?, onClick? }, imagePosition?: 'left'|'right'|'center', badge?, price?, rating?, images?: [{ src, alt? }] }
- Navigation: { logo?: { text?, image?, onClick? }, menuItems?: [{ label, action? }], cartIcon?: { itemCount?, action? }, sticky?: boolean, transparent?: boolean }
- Testimonials: { title?, subtitle?, testimonials?: [{ id?, name, role?, company?, content, image?, rating? }], displayMode?: 'grid' | 'carousel' | 'single', itemsPerRow? }
- Accordion: { title?, subtitle?, items?: [{ id?, title, content: string | [{label, value}], icon?, action? }], allowMultiple?, defaultOpen?: string | string[] }
- RecommendedProducts: { title?, subtitle?, products?: [{ id?, title, price?, image?, cta?: { label?, onClick? } }], layout?: 'grid'|'slider' }
- CheckoutForm: { title?, description?, form: { id, fields: [{ name, label, type, required?, validator?, mask?, placeholder? }], submitButton: { label, onClick? } } }
- Footer: { logo?: { text?, image? }, newsletter?: { title?, description?, placeholder?, submitButton?: { label?, onClick? } }, links?: [{ label, links: [{label, onClick?}] }], copyright?, socialLinks?: [{platform, url}] }
- Wrapper: { sections: LayoutSection[], className?, style?, tag? (e.g. 'section', 'div') }

--- 4. ACTION SCHEMAS ---
- navigate: { "type": "navigate", "url": "step-id" }
- redirect: { "type": "redirect", "url": "https://...", "target": "_blank" | "_self" }
- setState: { "type": "setState", "key": "key", "value": any, "merge"?: boolean }
- cart: { "type": "cart", "operation": "add" | "remove" | "update" | "clear", "item"?: object }

TASK:
Analyze the HTML snippets and extract:
1. The best matching Component.
2. All relevant data mapped to that component's props, INCLUDING IMAGES AND STYLES.
3. Logical actions for every interactive element (buttons/links).

OUTPUT FORMAT (Strict JSON):
{
  "theme": { 
    "colors": { "primary": "hex", "secondary": "hex", "background": "hex", "text": "hex" }, 
    "fonts": { "display": "name", "body": "name" }
  },
  "mappings": [
    {
      "sectionId": "original-id",
      "suggestedComponent": "RegistryKey",
      "props": { ... },
      "originalStyles": { ... },
      "htmlSnippet": "THE ORIGINAL HTML SNIPPET FOR THIS SECTION",
      "actions": { "actionName": { actionObject } },
      "confidence": 0.0 to 1.0,
      "isNew": boolean
    }
  ]
}
`;

export const getAnalyzeUserPrompt = (title, theme, sections) => `
Analyze these sections from the website "${title}" for 1:1 REPLICATION:
Site Title: ${title}
Theme Data: ${JSON.stringify(theme)}

SECTIONS DATA (WITH STYLES AND IMAGES):
${sections.map(s => `ID: ${s.id}
TAG: ${s.tagName}
TEXT: ${s.innerText}
IMAGES: ${JSON.stringify(s.images)}
STYLES: ${JSON.stringify(s.styles)}
HTML: ${s.htmlSnippet}
---`).join('\n')}
`;

export const GENERATE_COMPONENT_SYSTEM_PROMPT = `
You are a senior React developer building components for a high-performance Landing Page Engine.

ARCHITECTURAL RULES:
1. PURE & DUMB: Components must receive all data via 'props'. No internal state or logic.
2. ACTIONS: Use 'dispatcher' and 'actions' from props for all interactions.
   - Call 'dispatcher.dispatchNamed("actionName", actions)' for named actions from layout.
   - Call 'dispatcher.dispatch({ type: "..." })' for inline actions.
3. LOADING STATES: Use 'useActionDispatch' hook for all buttons/CTAs.
4. THEMING: Use CSS variables strictly (e.g., var(--color-primary), var(--font-body)).
5. STYLING: Use Tailwind CSS utility classes.
6. EXPORT: Must be a default export.

PROPS INTERFACE:
interface Props {
  // Content props (passed directly from section.props in JSON)
  title?: string;
  subtitle?: string;
  description?: string;
  images?: Array<{ src: string; alt?: string }>;
  // ... other data keys from layout ...

  // Engine props (automatically injected)
  dispatcher: ActionDispatcher;
  actions?: Record<string, Action>;
  state: Record<string, unknown>; // Global engine state (use only for interpolated data)
  [key: string]: any; 
}

REQUIRED IMPORTS:
import React from 'react';
import type { ActionDispatcher, Action } from '../../engine/ActionDispatcher';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';
`;

export const getGenerateComponentUserPrompt = (componentName, suggestedType, props, html, originalStyles) => `
Generate a React component named '${componentName}'.

CONTEXT:
- Suggested Base Type: ${suggestedType}
- Target Data Structure: ${JSON.stringify(props)}
- Original HTML Structure: ${html}
- Original Computed Styles: ${JSON.stringify(originalStyles)}

CRITICAL: 
- Use the 'Target Data Structure' directly as 'props' (e.g., 'props.title', 'props.images').
- Use the 'Original HTML Structure' AND 'Original Computed Styles' to inform your JSX layout, element nesting, and specific Tailwind classes to match the design 1:1.
- For fonts, colors, and border radius, use the CSS variables provided in the design system (e.g., var(--color-primary), var(--font-body), var(--radius-button)).
- The component must look professional and include a primary CTA button using the Action system.
- JSON ESCAPING: Ensure all content inside the JSON 'code' string is correctly escaped (newlines as \\n, backslashes as \\\\). Do NOT escape single quotes like \\' because they are invalid in JSON.
Respond ONLY with a JSON object: { "code": "full tsx code here" }
`;
