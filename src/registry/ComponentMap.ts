import { lazy } from 'react';

// Component registry mapping string keys to lazy-loaded React components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ComponentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  Hero: lazy(() => import('../components/sections/Hero')),
  SimpleCTA: lazy(() => import('../components/sections/SimpleCTA')),
  Features: lazy(() => import('../components/sections/Features')),
  Pricing: lazy(() => import('../components/sections/Pricing')),
  Testimonials: lazy(() => import('../components/sections/Testimonials')),
  ContactForm: lazy(() => import('../components/sections/ContactForm')),
  Footer: lazy(() => import('../components/sections/Footer')),
};

export default ComponentMap;