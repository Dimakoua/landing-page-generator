import { describe, it, expect } from 'vitest';
import ComponentMap from '@/registry/ComponentMap';
import { keyFromPath } from '@/registry/keyFromPath';

describe('ComponentMap (auto-discovery)', () => {
  it('should expose known components discovered from src/components', () => {
    // Key components that must be discoverable by the registry
    expect(ComponentMap.Hero).toBeDefined();
    expect(ComponentMap.Navigation).toBeDefined();
    expect(ComponentMap.Cart).toBeDefined();
    expect(ComponentMap.Accordion).toBeDefined();
    expect(ComponentMap.CheckoutForm).toBeDefined();
    expect(ComponentMap.Confirmation).toBeDefined();
    expect(ComponentMap.Footer).toBeDefined();
    expect(ComponentMap.RecommendedProducts).toBeDefined();
    expect(ComponentMap.Testimonials).toBeDefined();
  });

  it('should not create unexpected keys for non-component files', () => {
    // A random name that should not exist
    expect((ComponentMap as Record<string, unknown>)['NotAComponent']).toBeUndefined();
    expect((ComponentMap as Record<string, unknown>)['SomeRandomKey']).toBeUndefined();
  });

  it('should lazy load components', () => {
    // Components should be lazy-loaded React components
    expect(typeof ComponentMap.Hero).toBe('object');
    expect(ComponentMap.Hero.$$typeof).toBeDefined(); // React lazy component
  });
});

describe('keyFromPath utility', () => {
  it('should extract component name from file path', () => {
    expect(keyFromPath('src/components/Hero.tsx')).toBe('Hero');
    expect(keyFromPath('src/components/Navigation.tsx')).toBe('Navigation');
    expect(keyFromPath('src/components/Cart.tsx')).toBe('Cart');
  });

  it('should handle index files with folder name', () => {
    expect(keyFromPath('src/components/hero/index.tsx')).toBe('Hero');
    expect(keyFromPath('src/components/navigation/index.ts')).toBe('Navigation');
    expect(keyFromPath('src/components/accordion/index.jsx')).toBe('Accordion');
  });

  it('should handle kebab-case folder names', () => {
    expect(keyFromPath('src/components/recommended-products/index.tsx')).toBe('RecommendedProducts');
    expect(keyFromPath('src/components/checkout-form/CheckoutForm.tsx')).toBe('CheckoutForm');
  });

  it('should handle snake_case names', () => {
    expect(keyFromPath('src/components/test_component.tsx')).toBe('TestComponent');
    expect(keyFromPath('src/components/my_test_component/index.ts')).toBe('MyTestComponent');
  });

  it('should handle complex paths', () => {
    expect(keyFromPath('/full/path/src/components/hero/Hero.tsx')).toBe('Hero');
    expect(keyFromPath('components/accordion/Cart.tsx')).toBe('Cart');
  });

  it('should handle different file extensions', () => {
    expect(keyFromPath('src/components/Hero.tsx')).toBe('Hero');
    expect(keyFromPath('src/components/Hero.ts')).toBe('Hero');
    expect(keyFromPath('src/components/Hero.jsx')).toBe('Hero');
    expect(keyFromPath('src/components/Hero.js')).toBe('Hero');
  });

  it('should capitalize first letter', () => {
    expect(keyFromPath('src/components/hero.tsx')).toBe('Hero');
    expect(keyFromPath('src/components/navigation.tsx')).toBe('Navigation');
  });

  it('should handle edge cases', () => {
    expect(keyFromPath('Hero.tsx')).toBe('Hero');
    expect(keyFromPath('single')).toBe('single');
    expect(keyFromPath('a-b-c')).toBe('ABC');
  });
});
