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
- COLORS: Use the extracted 'styles.backgroundColor' and 'styles.color' to inform 'props' or custom styles if the component supports them.
- TEXT: Preserve the exact headlines, subtitles, and button labels found in the innerText.

--- 3. COMPONENT REGISTRY & PROPS ---
- Hero: { title?, subtitle?, description?, backgroundImage?, backgroundVideo?, primaryButton?: { label?, onClick? }, secondaryButton?: { label?, onClick? }, badge?, price?, originalPrice?, rating?, reviewsCount?, images?: [{ src, alt? }], colors?: [{ id, label?, color? }], quantity? }
- Navigation: { logo?: { text?, image?, onClick? }, menuItems?: [{ label, action? }], cartIcon?: { itemCount?, action? } }
- Testimonials: { title?, subtitle?, testimonials?: [{ id?, name, role?, company?, content, image?, rating? }], displayMode?: 'grid' | 'carousel' | 'single', itemsPerRow? }
- Accordion: { items?: [{ id?, title, content: string | [{label, value}], icon?, action? }], allowMultiple?, defaultOpen?: string | string[] }
- RecommendedProducts: { title?, products?: [{ id?, title, price?, image?, cta?: { label?, onClick? } }] }
- CheckoutForm: { title?, form: { id, fields: [{ name, label, type, required?, validator?, mask?, placeholder? }], submitButton: { label, onClick? } } }
- Confirmation: { title?, message?, userInfo?: { firstName?, lastName?, email? }, orderItems?: [{ id, name, price, quantity, color? }], orderTotal?, button?: { label?, onClick? } }
- Footer: { logo?: { text?, image? }, newsletter?: { title?, description?, placeholder?, submitButton?: { label?, onClick? } }, links?: [{ label, href?, onClick? }], copyright? }
- Cart: { title?, items?: [{ id, name, description, price, quantity, image, color? }], emptyCartMessage?, summary?: { totalLabel?, totalPrice?, checkoutButton?: { label?, onClick? } } }
- Wrapper: { sections: LayoutSection[], className?, style?, tag? (e.g. 'section', 'div') }
- LoadFromApi: { endpoint, method?, onError?, cacheEnabled?, cacheKey?, ttl? }
- HeatmapRecorder: { enabled?, trackClicks?, trackScroll?, trackAttention?, sampleRate?, analyticsProvider?, customEndpoint? }

--- 4. ACTION SCHEMAS ---
- navigate: { "type": "navigate", "url": "step-id" }
- redirect: { "type": "redirect", "url": "https://...", "target": "_blank" | "_self" }
- post/get: { "type": "post" | "get", "url": "...", "payload"?: {}, "stateKey"?: "key", "errorStateKey"?: "key", "onSuccess"?: { action }, "onError"?: { action }, "timeout"?: number }
- setState: { "type": "setState", "key": "key", "value": any, "merge"?: boolean }
- chain: { "type": "chain", "actions": [action1, action2] }
- cart: { "type": "cart", "operation": "add" | "remove" | "update" | "clear", "item"?: object }

TASK:
Analyze the HTML snippets and extract:
1. The best matching Component.
2. All relevant data mapped to that component's props, INCLUDING IMAGES AND STYLES.
3. Logical actions for every interactive element (buttons/links).

OUTPUT FORMAT (Strict JSON):
{
  "theme": { "primaryColor": "hex", "fontFamily": "name" },
  "mappings": [
    {
      "sectionId": "original-id",
      "suggestedComponent": "RegistryKey",
      "props": { ... },
      "actions": { "actionName": { actionObject } },
      "confidence": 0.0 to 1.0,
      "isNew": boolean
    }
  ]
}
`;

export const getAnalyzeUserPrompt = (title, colors, fontFamily, sections) => `
Analyze these sections from the website "${title}" for 1:1 REPLICATION:
Site Title: ${title}
Main Colors: ${colors.join(', ')}
Font: ${fontFamily}

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

export const getGenerateComponentUserPrompt = (componentName, suggestedType, props) => `
Generate a React component named '${componentName}'.
Context:
- Component Type: ${suggestedType}
- Data (passed as props): ${JSON.stringify(props)}

CRITICAL: 
- Use the data from the list above directly as 'props' (e.g., 'props.title', 'props.images').
- Do NOT look for this content inside 'props.state'.
- The component must look professional and include a primary CTA button using the Action system.
Respond ONLY with a JSON object: { "code": "full tsx code here" }
`;
