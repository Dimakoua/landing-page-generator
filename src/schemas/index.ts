import { z } from 'zod';
import { ActionSchema } from './actions';

// Theme schema for brand tokens (theme.json)
export const ThemeSchema = z.object({
  colors: z.record(z.string(), z.string()).optional(),
  fonts: z.record(z.string(), z.string()).optional(),
  radius: z.record(z.string(), z.string()).optional(),
  spacing: z.record(z.string(), z.string()).optional(),
});

// Flow schema for step ordering (flow.json)
export const FlowSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['normal', 'popup']).default('normal'),
    })
  ),
});

// Layout schema for section props and types (desktop.json / mobile.json)
export const LayoutSchema = z.object({
  sections: z.array(
    z.object({
      component: z.string(),
      props: z.record(z.string(), z.any()),
      actions: z.record(z.string(), ActionSchema).optional().describe('Named actions for this component'),
    })
  ),
});

// Inferred TypeScript types
export type Theme = z.infer<typeof ThemeSchema>;
export type Flow = z.infer<typeof FlowSchema>;
export type Layout = z.infer<typeof LayoutSchema>;