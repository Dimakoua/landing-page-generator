/*
 * Minimal synchronous sessionStorage encryption wrapper.
 * - Uses a simple XOR-based obfuscation keyed by a per-session fingerprint.
 * - Aims for "better than plaintext" (prevents casual inspection) while keeping API sync.
 * - Backwards-compatible: existing plaintext session values are still read correctly.
 *
 * Design notes:
 * - Fingerprint is generated once per session and persisted to sessionStorage under `__ufp`.
 * - Values written via `setItem` are stored as `enc:<base64>`.
 * - `getItem` transparently decrypts `enc:` values and returns raw strings for legacy data.
 *
 * Security: This is not a replacement for true cryptographic protection (no secret held
 * outside sessionStorage). It raises the bar against casual inspection in devtools.
 */

const PREFIX = 'enc:';
const UFP_KEY = '__ufp';
let cachedFingerprint: string | null = null;

// Toggle encryption: disabled by default in development so devs can inspect session storage.
// Can be overridden at runtime via `setEncryptionEnabled()` for testing or temporary debug.
let encryptionEnabled = !import.meta.env.DEV;
console.log(`[secureSession] Encryption is ${encryptionEnabled ? 'enabled' : 'disabled'} by default in this environment.`);

function randomHex(bytes = 16) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

function strToBytes(s: string) {
  return new TextEncoder().encode(s);
}

function bytesToStr(b: Uint8Array) {
  return new TextDecoder().decode(b);
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

// Simple XOR stream cipher (synchronous, small code). Not cryptographically strong,
// but sufficient for obfuscation / preventing casual inspection.
function xorTransform(src: Uint8Array, key: Uint8Array) {
  const out = new Uint8Array(src.length);
  const klen = key.length || 1;
  for (let i = 0; i < src.length; i++) {
    out[i] = src[i] ^ key[i % klen];
  }
  return out;
}

export function getFingerprint(): string {
  if (cachedFingerprint) return cachedFingerprint;

  // Read raw from underlying sessionStorage (avoid recursion)
  try {
    const existing = window.sessionStorage.getItem(UFP_KEY);
    if (existing) {
      cachedFingerprint = existing;
      return cachedFingerprint;
    }
  } catch {
    // If sessionStorage is unavailable, generate ephemeral fingerprint (non-persisted)
    cachedFingerprint = randomHex(12);
    return cachedFingerprint;
  }

  // Generate and persist
  cachedFingerprint = randomHex(24);
  try {
    window.sessionStorage.setItem(UFP_KEY, cachedFingerprint);
  } catch {
    // best-effort: keep in memory only
  }
  return cachedFingerprint;
}

export function encryptString(plaintext: string, fingerprint?: string) {
  if (!encryptionEnabled) return plaintext;
  const key = strToBytes(fingerprint || getFingerprint());
  const pt = strToBytes(plaintext);
  const cipher = xorTransform(pt, key);
  return PREFIX + bytesToBase64(cipher);
}

export function decryptString(ciphertextWithPrefix: string, fingerprint?: string) {
  if (!encryptionEnabled) return ciphertextWithPrefix;
  if (!ciphertextWithPrefix) return ciphertextWithPrefix;
  if (!ciphertextWithPrefix.startsWith(PREFIX)) return ciphertextWithPrefix; // plaintext or legacy
  const b64 = ciphertextWithPrefix.slice(PREFIX.length);
  try {
    const cipher = base64ToBytes(b64);
    const key = strToBytes(fingerprint || getFingerprint());
    const pt = xorTransform(cipher, key);
    return bytesToStr(pt);
  } catch {
    // On any decode error, return the raw value so callers can handle gracefully
    return ciphertextWithPrefix;
  }
}

// Public Storage-like API (synchronous)
export function getItem(key: string): string | null {
  const raw = window.sessionStorage.getItem(key);
  if (raw == null) return null;
  // If encryption disabled, return raw. If enabled and value is prefixed, decrypt.
  if (!encryptionEnabled) return raw;
  if (typeof raw === 'string' && raw.startsWith(PREFIX)) {
    return decryptString(raw);
  }
  return raw;
}

export function setItem(key: string, value: string) {
  const str = typeof value === 'string' ? value : String(value);
  const out = encryptionEnabled ? encryptString(str) : str;
  window.sessionStorage.setItem(key, out);
}

export function removeItem(key: string) {
  window.sessionStorage.removeItem(key);
}

export function clear() {
  window.sessionStorage.clear();
}

// Control & Export utilities for tests / debugging
export function setEncryptionEnabled(enabled: boolean) {
  encryptionEnabled = enabled;
}

export function isEncryptionEnabled() {
  return encryptionEnabled;
}

export default {
  getItem,
  setItem,
  removeItem,
  clear,
  getFingerprint,
  encryptString,
  decryptString,
  setEncryptionEnabled,
  isEncryptionEnabled,
};