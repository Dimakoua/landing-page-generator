// Basic type definitions without Zod
export interface Theme {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  radius?: Record<string, string>;
  spacing?: Record<string, string>;
  allowCustomHtml?: boolean;
}

export interface FlowStep {
  id: string;
  type?: 'normal' | 'popup';
  layout?: string | null;
}

export interface Flow {
  layout?: string;
  steps: FlowStep[];
}

export interface LayoutSection {
  id?: string;
  component: string;
  props?: Record<string, any>;
  actions?: Record<string, any>;
}

export interface Layout {
  state?: Record<string, any>;
  sections: LayoutSection[];
}