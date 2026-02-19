import { describe, it, expect } from 'vitest';
import { getClientInfo } from '@/engine/utils/getClientInfo';

describe('getClientInfo', () => {
  it('detects iOS from navigator.userAgent/platform', () => {
    Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', configurable: true });
    Object.defineProperty(navigator, 'platform', { value: 'iPhone', configurable: true });

    const info = getClientInfo();
    expect(info.userAgent).toContain('iPhone');
    expect(info.platform).toBe('iPhone');
    expect(info.os).toBe('ios');
  });

  it('returns unknown when navigator is not available', () => {
    const originalNav = (global as any).navigator;
    try {
      (global as any).navigator = undefined;
      const info = getClientInfo();
      expect(info.userAgent).toBe('');
      expect(info.platform).toBe('');
      expect(info.os).toBe('unknown');
    } finally {
      (global as any).navigator = originalNav;
    }
  });
});
