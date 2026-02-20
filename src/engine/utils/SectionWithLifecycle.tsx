import React from 'react';
import { useComponentLifecycle } from '../hooks/useComponentLifecycle';
import type { ActionDispatcher } from '../ActionDispatcher';
import type { LifetimeActions } from '../../schemas/actions';

interface SectionWithLifecycleProps {
  dispatcher: ActionDispatcher;
  lifetime?: LifetimeActions;
  id?: string;
  children: React.ReactNode;
}

/**
 * SectionWithLifecycle
 * A internal wrapper component that applies declarative lifecycle hooks to a section.
 */
export const SectionWithLifecycle: React.FC<SectionWithLifecycleProps> = ({
  dispatcher,
  lifetime,
  id,
  children,
}) => {
  useComponentLifecycle(dispatcher, lifetime, id);
  return <>{children}</>;
};
