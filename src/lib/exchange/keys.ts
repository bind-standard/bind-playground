import type { JWK } from 'jose';

const KEYS_STORAGE_KEY = 'bind-playground-keys';
const ISSUER_STORAGE_KEY = 'bind-playground-issuer';

export interface StoredKeyPair {
  privateKey: JWK;
  publicKey: JWK;
  kid: string;
}

export function saveKeyPair(pair: StoredKeyPair): void {
  try {
    localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(pair));
  } catch {
    // ignore
  }
}

export function loadKeyPair(): StoredKeyPair | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(KEYS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredKeyPair;
      if (parsed.privateKey && parsed.publicKey && parsed.kid) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveIssuer(iss: string): void {
  try {
    localStorage.setItem(ISSUER_STORAGE_KEY, iss);
  } catch {
    // ignore
  }
}

export function loadIssuer(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(ISSUER_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}
