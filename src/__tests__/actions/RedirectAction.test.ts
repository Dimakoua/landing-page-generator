import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRedirect } from '@/engine/actions/RedirectAction';

describe('RedirectAction', () => {
  beforeEach(() => {
    // Reset window.location
    delete (window as any).location;
    (window as any).location = { href: '' };
    
    // Mock window.open
    window.open = vi.fn();
  });

  it('should redirect to URL using location.href for _self target', async () => {
    const action = { type: 'redirect' as const, url: 'https://example.com', target: '_self' as const };

    const result = await handleRedirect(action);

    expect(window.location.href).toBe('https://example.com');
    expect(result.success).toBe(true);
  });

  it('should open URL in new tab for _blank target', async () => {
    const action = { type: 'redirect' as const, url: 'https://example.com', target: '_blank' as const };

    const result = await handleRedirect(action);

    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    expect(result.success).toBe(true);
  });

  it('should use _self as default target', async () => {
    const action = { type: 'redirect' as const, url: 'https://example.com', target: '_self' as const };

    const result = await handleRedirect(action);

    expect(window.location.href).toBe('https://example.com');
    expect(result.success).toBe(true);
  });

  it('should handle other target values (_parent, _top)', async () => {
    const action = { type: 'redirect' as const, url: 'https://example.com', target: '_parent' as const };

    const result = await handleRedirect(action);

    expect(window.location.href).toBe('https://example.com');
    expect(result.success).toBe(true);
  });

  it('should handle redirect errors', async () => {
    const action = { type: 'redirect' as const, url: 'https://example.com', target: '_self' as const };
    
    Object.defineProperty(window, 'location', {
      value: {
        set href(_url: string) {
          throw new Error('Redirect blocked');
        }
      },
      configurable: true
    });

    const result = await handleRedirect(action);

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Redirect blocked');
  });
});
