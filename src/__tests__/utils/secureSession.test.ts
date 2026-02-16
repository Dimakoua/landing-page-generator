import { describe, it, expect, beforeEach } from 'vitest';
import secureSession, { setEncryptionEnabled, isEncryptionEnabled } from '@/utils/secureSession';

describe('secureSession toggle behavior', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // ensure deterministic starting state in tests
    setEncryptionEnabled(false);
  });

  it('defaults to encryption disabled in dev (test env)', () => {
    expect(isEncryptionEnabled()).toBe(false);
  });

  it('stores plaintext when encryption is disabled', () => {
    setEncryptionEnabled(false);
    secureSession.setItem('plain_key', 'plain');
    expect(sessionStorage.getItem('plain_key')).toBe('plain');
    expect(secureSession.getItem('plain_key')).toBe('plain');
  });

  it('stores encrypted value when encryption is enabled', () => {
    setEncryptionEnabled(true);
    secureSession.setItem('enc_key', 'secret');

    const raw = sessionStorage.getItem('enc_key');
    expect(typeof raw).toBe('string');
    // encrypted values are prefixed with 'enc:' when encryption is enabled
    expect(raw!.startsWith('enc:')).toBe(true);

    // secureSession.getItem should transparently decrypt
    expect(secureSession.getItem('enc_key')).toBe('secret');
  });
});