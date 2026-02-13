import { describe, it, expect } from 'vitest';
import { validators } from '@/utils/validators';

describe('Validators', () => {
  describe('cardNumber validator', () => {
    it('validates correct card numbers', () => {
      expect(validators.cardNumber('4111111111111111')).toBeNull(); // Visa
      expect(validators.cardNumber('5555555555554444')).toBeNull(); // Mastercard
      expect(validators.cardNumber('378282246310005')).toBeNull(); // Amex
      expect(validators.cardNumber('4111 1111 1111 1111')).toBeNull(); // With spaces
      expect(validators.cardNumber('4111-1111-1111-1111')).toBeNull(); // With dashes
    });

    it('rejects invalid card numbers', () => {
      expect(validators.cardNumber('')).toBe('Card number must be 13-19 digits');
      expect(validators.cardNumber('123')).toBe('Card number must be 13-19 digits');
      expect(validators.cardNumber('411111111111111111111')).toBe('Card number must be 13-19 digits');
      expect(validators.cardNumber('abcd123456789012')).toBe('Card number must be 13-19 digits');
      expect(validators.cardNumber('4111111111111112')).toBe('Invalid card number'); // Fails Luhn check
    });
  });

  describe('cvv validator', () => {
    it('validates correct CVV codes', () => {
      expect(validators.cvv('123')).toBeNull();
      expect(validators.cvv('1234')).toBeNull(); // Amex
    });

    it('rejects invalid CVV codes', () => {
      expect(validators.cvv('')).toBe('CVV must be 3 or 4 digits');
      expect(validators.cvv('12')).toBe('CVV must be 3 or 4 digits');
      expect(validators.cvv('12345')).toBe('CVV must be 3 or 4 digits');
      expect(validators.cvv('abc')).toBe('CVV must be 3 or 4 digits');
    });
  });

  describe('expiryDate validator', () => {
    it('validates correct expiry dates', () => {
      expect(validators.expiryDate('12/30')).toBeNull(); // Future date
      expect(validators.expiryDate('1230')).toBeNull();
      expect(validators.expiryDate('01/35')).toBeNull(); // Far future
    });

    it('rejects invalid expiry dates', () => {
      expect(validators.expiryDate('')).toBe('Expiry date must be in MM/YY format');
      expect(validators.expiryDate('13/30')).toBe('Invalid month');
      expect(validators.expiryDate('00/30')).toBe('Invalid month');
      expect(validators.expiryDate('12/25')).toBe('Card has expired'); // Past date
      expect(validators.expiryDate('abcd')).toBe('Expiry date must be in MM/YY format');
    });

    it('rejects expired dates', () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);
      const month = String(pastDate.getMonth() + 1).padStart(2, '0');
      const year = String(pastDate.getFullYear()).slice(-2);

      expect(validators.expiryDate(`${month}/${year}`)).toBe('Card has expired');
    });
  });
});