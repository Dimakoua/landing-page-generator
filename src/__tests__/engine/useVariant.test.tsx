import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVariant } from '@/engine/hooks/useVariant';

describe('useVariant', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('reads variant from URL param when present', () => {
    const original = window.location.href;
    window.history.pushState({}, '', '/?variant=B');

    const { result } = renderHook(() => useVariant('test'));
    expect(result.current).toBe('B');

    window.history.pushState({}, '', original);
  });

  it('reads variant from sessionStorage if available', () => {
    sessionStorage.setItem('ab_variant_test', 'A');
    const { result } = renderHook(() => useVariant('test'));
    expect(result.current).toBe('A');
  });

  it('assigns a random variant and persists when no source present', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.7); // > 0.5 -> B
    const { result } = renderHook(() => useVariant('test'));
    expect(result.current).toBe('B');
    expect(sessionStorage.getItem('ab_variant_test')).toBe('B');
    (Math.random as any).mockRestore();
  });
});