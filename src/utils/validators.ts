/**
 * Validation utilities for form fields
 */

export type ValidatorFunction = (value: string) => string | null;

/**
 * Validates a credit card number using the Luhn algorithm
 */
export const validateCardNumber: ValidatorFunction = (value: string): string | null => {
  const cleaned = value.replace(/\s+/g, '').replace(/-/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) {
    return 'Card number must be 13-19 digits';
  }
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  if (sum % 10 !== 0) {
    return 'Invalid card number';
  }
  return null;
};

/**
 * Validates expiry date in MM/YY or MMYY format
 */
export const validateExpiryDate: ValidatorFunction = (value: string): string | null => {
  const cleaned = value.replace(/\s+/g, '');
  const match = cleaned.match(/^(\d{2})\/?(\d{2})$/);
  if (!match) {
    return 'Expiry date must be in MM/YY format';
  }
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000; // Assume 20xx
  if (month < 1 || month > 12) {
    return 'Invalid month';
  }
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Card has expired';
  }
  return null;
};

/**
 * Validates CVV (3 or 4 digits)
 */
export const validateCvv: ValidatorFunction = (value: string): string | null => {
  if (!/^\d{3,4}$/.test(value)) {
    return 'CVV must be 3 or 4 digits';
  }
  return null;
};

// Map of validator names to functions
export const validators: Record<string, ValidatorFunction> = {
  cardNumber: validateCardNumber,
  expiryDate: validateExpiryDate,
  cvv: validateCvv,
};