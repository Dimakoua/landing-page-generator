/**
 * Input masking utilities for form fields
 */

export type MaskFunction = (value: string) => string;

/**
 * Masks credit card number with spaces every 4 digits
 */
export const maskCardNumber: MaskFunction = (value: string): string => {
  const cleaned = value.replace(/\s+/g, '').replace(/\D/g, '');
  const match = cleaned.match(/\d{1,4}/g);
  return match ? match.join(' ').substr(0, 19) : ''; // Max 19 chars (16 digits + 3 spaces)
};

/**
 * Masks expiry date as MM/YY
 */
export const maskExpiryDate: MaskFunction = (value: string): string => {
  const cleaned = value.replace(/\D+/g, '');
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  return cleaned;
};

/**
 * Masks CVV (no special formatting, just limit to 4 chars)
 */
export const maskCvv: MaskFunction = (value: string): string => {
  return value.replace(/\D+/g, '').substring(0, 4);
};

// Map of mask names to functions
export const masks: Record<string, MaskFunction> = {
  cardNumber: maskCardNumber,
  expiryDate: maskExpiryDate,
  cvv: maskCvv,
};