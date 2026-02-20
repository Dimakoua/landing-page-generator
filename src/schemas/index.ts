import { LifetimeActions, ActionOrArray } from './actions';

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
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  analytics?: {
    googleAnalytics?: {
      measurementId: string;
      additionalIds?: string[];
    };
  };
  steps: FlowStep[];
}

export interface ConditionSpec {
  condition: 'stateEquals' | 'stateExists' | 'stateMatches' | 'userAgentMatches' | 'userAgentIncludes' | 'custom' | string;
  key?: string;
  value?: unknown;
  pattern?: string;
  flags?: string;
}

export interface LayoutSection {
  id?: string;
  component: string;
  props?: Record<string, unknown>;
  actions?: Record<string, ActionOrArray>;
  /** Optional component lifecycle actions */
  lifetime?: LifetimeActions;
  /** Optional declarative condition that controls whether this section is rendered */
  condition?: ConditionSpec;
}

export interface Layout {
  state?: Record<string, unknown>;
  sections: LayoutSection[];
}