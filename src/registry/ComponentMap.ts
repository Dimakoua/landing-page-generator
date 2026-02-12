import { lazy } from 'react';

// Component registry mapping string keys to lazy-loaded React components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ComponentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  Hero: lazy(() => import('../components/hero/Hero')),
  Navigation: lazy(() => import('../components/navigation/Navigation')),
  Footer: lazy(() => import('../components/footer/Footer')),
  Accordion: lazy(() => import('../components/accordion/Accordion')),
  Testimonials: lazy(() => import('../components/testimonials/Testimonials')),
  RecommendedProducts: lazy(() => import('../components/products/RecommendedProducts')),
  Cart: lazy(() => import('../components/accordion/Cart')),
  CheckoutForm: lazy(() => import('../components/checkout/CheckoutForm')),
  Confirmation: lazy(() => import('../components/confirmation/Confirmation')),
};

export default ComponentMap;