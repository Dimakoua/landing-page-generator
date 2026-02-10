import { z } from 'zod';

// Theme schema for brand tokens (theme.json)
export const ThemeSchema = z.object({
  colors: z.record(z.string(), z.string()).optional(),
  fonts: z.record(z.string(), z.string()).optional(),
  radius: z.record(z.string(), z.string()).optional(),
  spacing: z.record(z.string(), z.string()).optional(),
});

// Flow schema for step transitions and routes (flow.json)
export const FlowSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string(),
      next: z.string().optional(),
      onApprove: z.string().optional(),
      onDecline: z.string().optional(),
      type: z.enum(['normal', 'popup']).default('normal'),
      actions: z.array(
        z.object({
          type: z.string(),
          url: z.string().optional(),
          method: z.string().optional(),
          payload: z.record(z.string(), z.any()).optional(),
        })
      ).optional(),
    })
  ),
});

// Layout schema for section props and types (desktop.json / mobile.json)
export const LayoutSchema = z.object({
  sections: z.array(
    z.object({
      component: z.string(),
      props: z.record(z.string(), z.any()),
    })
  ),
});

// Inferred TypeScript types
export type Theme = z.infer<typeof ThemeSchema>;
export type Flow = z.infer<typeof FlowSchema>;
export type Layout = z.infer<typeof LayoutSchema>;