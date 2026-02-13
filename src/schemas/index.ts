import { z } from 'zod';
import { ActionSchema } from './actions';
import { EventSchema, EVENT_TYPES } from './events';

/**
 * Theme schema for brand tokens (theme.json)
 * Defines visual styling: colors, fonts, spacing, and border radius
 * All properties are optional and used by ThemeInjector to generate CSS variables
 */
export const ThemeSchema = z.object({
  colors: z.record(z.string(), z.string()).optional().describe('Color palette (e.g., primary, secondary)'),
  fonts: z.record(z.string(), z.string()).optional().describe('Font families (e.g., heading, body)'),
  radius: z.record(z.string(), z.string()).optional().describe('Border radius values for consistent styling'),
  spacing: z.record(z.string(), z.string()).optional().describe('Spacing/padding values (e.g., xs, sm, md, lg)'),
});

/**
 * Flow schema for step ordering and layout configuration (flow.json)
 * Defines the sequence of pages and how to render them
 * Supports global layout (template) with step-specific overrides or step folder loading
 */
export const FlowSchema = z.object({
  layout: z.string().optional().describe(
    'Global layout path (e.g., "layouts/main"). Used as template for all steps unless overridden.'
  ),
  steps: z.array(
    z.object({
      id: z.string().describe('Unique step identifier (e.g., "home", "checkout")'),
      type: z.enum(['normal', 'popup']).default('normal').describe('Render type: normal (replaces page) or popup (overlay)'),
      layout: z.union([z.string(), z.null()]).optional().describe(
        'Step-specific layout override (e.g., "layouts/checkout"). Set to null to load from steps/{id}/ folder instead.'
      ),
    })
  ).describe('Ordered list of steps in the funnel'),
});

/**
 * Layout schema for section props and types
 * Supports layouts folder JSON files and steps folder JSON files
 * Defines which components render and their props
 * Supports template string interpolation: {{state.path.to.value}}
 * Special component: "StepContent" - replaces with step-specific layout sections
 */
export const LayoutSchema = z.object({
  state: z.record(z.string(), z.any()).optional().describe(
    'Initial state for layout. Merged with persisted state on load. Persisted state takes precedence.'
  ),
  sections: z.array(
    z.object({
      id: z.string().optional().describe('Unique ID for this section (used for anchor links)'),
      component: z.string().describe(
        'Component name (Hero, Navigation, Footer, StepContent, Cart, Accordion, Testimonials) or custom'
      ),
      props: z.record(z.string(), z.any()).optional().describe(
        'Props for component. Supports template interpolation: {{state.path}} becomes actual state value'
      ),
      actions: z.record(z.string(), ActionSchema).optional().describe('Named action handlers for component events'),
    })
  ).describe('Sections to render for this layout'),
});

// Inferred TypeScript types
export type Theme = z.infer<typeof ThemeSchema>;
export type Flow = z.infer<typeof FlowSchema>;
export type Layout = z.infer<typeof LayoutSchema>;

// Re-export event types and schemas
export { EventSchema, EVENT_TYPES } from './events';
export type { Event, EventType } from './events';