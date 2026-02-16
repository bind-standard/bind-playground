import { SignJWT, CompactEncrypt, exportJWK, importJWK, calculateJwkThumbprint } from 'jose';
import type { JWK } from 'jose';

const encoder = new TextEncoder();

export function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64urlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function sha256Base64url(input: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return base64url(new Uint8Array(hash));
}

export async function generateKeyPair(): Promise<{
  privateKey: JWK;
  publicKey: JWK;
  kid: string;
}> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  );
  const privateKey = await exportJWK(keyPair.privateKey);
  const publicKey = await exportJWK(keyPair.publicKey);
  // Remove private component from public key
  delete publicKey.d;
  const kid = await computeKid(publicKey);
  return { privateKey: { ...privateKey, kid }, publicKey: { ...publicKey, kid }, kid };
}

export async function importPrivateKey(jwk: JWK): Promise<CryptoKey> {
  return importJWK(jwk, 'ES256') as Promise<CryptoKey>;
}

export async function computeKid(jwk: JWK): Promise<string> {
  return calculateJwkThumbprint(jwk, 'sha256');
}

export async function signBundle(
  bundle: Record<string, unknown>,
  privateKeyJwk: JWK,
  kid: string,
  iss: string,
): Promise<string> {
  const key = await importPrivateKey(privateKeyJwk);
  return new SignJWT({ ...bundle })
    .setProtectedHeader({ alg: 'ES256', kid })
    .setIssuer(iss)
    .setIssuedAt()
    .sign(key);
}

export async function encryptJws(
  jws: string,
): Promise<{ jwe: string; key: Uint8Array }> {
  const aesKey = crypto.getRandomValues(new Uint8Array(32));
  const jwe = await new CompactEncrypt(encoder.encode(jws))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM', cty: 'application/bind+json' })
    .encrypt(aesKey);
  return { jwe, key: aesKey };
}

export async function createProofJwt(
  jwe: string,
  privateKeyJwk: JWK,
  kid: string,
  iss: string,
): Promise<string> {
  const sub = await sha256Base64url(jwe);
  const key = await importPrivateKey(privateKeyJwk);
  return new SignJWT({ sub })
    .setProtectedHeader({ alg: 'ES256', kid })
    .setIssuer(iss)
    .setIssuedAt()
    .sign(key);
}

/**
 * Extract the issuer slug from a full URL or bare slug.
 * Handles: "https://bindpki.org/my-org", "https://bind-pki.org/my-org", "my-org"
 */
export function extractIssuerSlug(issuer: string): string {
  try {
    const url = new URL(issuer);
    return url.pathname.replace(/^\//, '').replace(/\/$/, '');
  } catch {
    return issuer.replace(/^\//, '').replace(/\/$/, '');
  }
}

/**
 * Fetch the JWKS for an issuer from the BIND Directory.
 * Returns the keys array, or throws on failure.
 */
export async function fetchIssuerJwks(issuer: string): Promise<JWK[]> {
  const slug = extractIssuerSlug(issuer);
  if (!slug) throw new Error('Empty issuer');
  const url = `https://bindpki.org/${slug}/.well-known/jwks.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'Issuer not found in directory' : `Failed to fetch JWKS (${res.status})`);
  }
  const jwks = await res.json() as { keys?: JWK[] };
  if (!jwks.keys || !Array.isArray(jwks.keys)) {
    throw new Error('Invalid JWKS format');
  }
  return jwks.keys;
}

export function buildBindxLink(
  url: string,
  key: Uint8Array,
  exp: number,
  flag: string,
  label?: string,
): string {
  const payload: Record<string, unknown> = {
    url,
    key: base64url(key),
    exp,
    flag,
  };
  if (label) payload.label = label;
  const json = JSON.stringify(payload);
  const encoded = base64url(encoder.encode(json));
  return `bindx://${encoded}`;
}
