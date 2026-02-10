import { lazy } from 'react';

// Component registry mapping string keys to lazy-loaded React components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ComponentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  Hero: lazy(() => import('../components/sections/Hero')),
  SimpleCTA: lazy(() => import('../components/sections/SimpleCTA')),
};

export default ComponentMap;