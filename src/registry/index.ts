import { lazy } from 'react';

// Component registry mapping string keys to lazy-loaded React components
const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  Hero: lazy(() => import('../components/Hero')),
  SimpleCTA: lazy(() => import('../components/SimpleCTA')),
};

export default componentMap;