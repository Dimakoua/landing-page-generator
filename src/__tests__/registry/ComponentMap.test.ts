import { describe, it, expect } from 'vitest';
import ComponentMap from '@/registry/ComponentMap';

describe('ComponentMap (auto-discovery)', () => {
  it('should expose known components discovered from src/components', () => {
    // Key components that must be discoverable by the registry
    expect(ComponentMap.Hero).toBeDefined();
    expect(ComponentMap.Navigation).toBeDefined();
    expect(ComponentMap.Cart).toBeDefined();
  });

  it('should not create unexpected keys for non-component files', () => {
    // A random name that should not exist
    expect((ComponentMap as Record<string, unknown>)['NotAComponent']).toBeUndefined();
  });
});
