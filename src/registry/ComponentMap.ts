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
  Popup: lazy(() => import('../components/sections/Popup')),
  OrderSummary: lazy(() => import('../components/sections/OrderSummary')),
  Navigation: lazy(() => import('../components/sections/Navigation')),
  Stats: lazy(() => import('../components/sections/Stats')),
  FAQ: lazy(() => import('../components/sections/FAQ')),
  LogoCloud: lazy(() => import('../components/sections/LogoCloud')),
  Video: lazy(() => import('../components/sections/Video')),
  Timeline: lazy(() => import('../components/sections/Timeline')),
  Team: lazy(() => import('../components/sections/Team')),
  ComparisonTable: lazy(() => import('../components/sections/ComparisonTable')),
  Banner: lazy(() => import('../components/sections/Banner')),
  ContentBlock: lazy(() => import('../components/sections/ContentBlock')),
  Gallery: lazy(() => import('../components/sections/Gallery')),
  Newsletter: lazy(() => import('../components/sections/Newsletter')),
};

export default ComponentMap;