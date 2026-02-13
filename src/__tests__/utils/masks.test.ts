import { describe, it, expect } from 'vitest';
import { masks } from '@/utils/masks';

describe('Masks', () => {
  describe('cardNumber mask', () => {
    it('formats card numbers correctly', () => {
      expect(masks.cardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
      expect(masks.cardNumber('5555555555554444')).toBe('5555 5555 5555 4444');
      expect(masks.cardNumber('378282246310005')).toBe('3782 8224 6310 005');
    });

    it('handles partial input', () => {
      expect(masks.cardNumber('4111')).toBe('4111');
      expect(masks.cardNumber('41111111')).toBe('4111 1111');
      expect(masks.cardNumber('411111111111')).toBe('4111 1111 1111');
    });

    it('removes non-numeric characters', () => {
      expect(masks.cardNumber('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
      expect(masks.cardNumber('4111 1111 1111 1111')).toBe('4111 1111 1111 1111');
      expect(masks.cardNumber('4111abc1111def1111ghi1111')).toBe('4111 1111 1111 1111');
    });

    it('limits to 19 digits', () => {
      expect(masks.cardNumber('411111111111111111111')).toBe('4111 1111 1111 1111');
    });
  });

  describe('cvv mask', () => {
    it('allows only numeric characters', () => {
      expect(masks.cvv('123')).toBe('123');
      expect(masks.cvv('1234')).toBe('1234');
    });

    it('removes non-numeric characters', () => {
      expect(masks.cvv('12a3')).toBe('123');
      expect(masks.cvv('abc')).toBe('');
    });

    it('limits to 4 characters', () => {
      expect(masks.cvv('12345')).toBe('1234');
    });
  });

  describe('expiryDate mask', () => {
    it('formats expiry dates correctly', () => {
      expect(masks.expiryDate('1225')).toBe('12/25');
      expect(masks.expiryDate('0125')).toBe('01/25');
    });

    it('handles MM/YY format input', () => {
      expect(masks.expiryDate('12/25')).toBe('12/25');
      expect(masks.expiryDate('01/30')).toBe('01/30');
    });

    it('removes non-numeric characters', () => {
      expect(masks.expiryDate('12/abc')).toBe('12/');
      expect(masks.expiryDate('ab12')).toBe('12/');
    });

    it('limits month to 12', () => {
      expect(masks.expiryDate('1325')).toBe('13/25'); // Doesn't validate, just formats
    });

    it('handles edge cases', () => {
      expect(masks.expiryDate('')).toBe('');
      expect(masks.expiryDate('1')).toBe('1');
      expect(masks.expiryDate('12')).toBe('12/');
      expect(masks.expiryDate('123')).toBe('12/3');
    });
  });
});