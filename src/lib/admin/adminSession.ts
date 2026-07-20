import "server-only";

/**
 * Stopgap admin auth (audit S2): a single shared password + a signed,
 * expiring session cookie. This is not per-account auth — it closes the
 * "anyone who types /admin gets the full console" hole until real
 * user/role-based auth ships.
 */

export const ADMIN_SESSION_COOKIE = "iq_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured. Set it as a server-only env var " +
        "(any long random string) — never NEXT_PUBLIC_-prefixed."
    );
  }
  return secret;
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return base64UrlEncode(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createAdminSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(String(expiresAt)));
  const signature = await hmacSign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export async function isValidAdminSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;

  let expectedSignature: string;
  try {
    expectedSignature = await hmacSign(payloadB64);
  } catch {
    return false;
  }
  if (!timingSafeEqual(expectedSignature, signature)) return false;

  const expiresAt = Number(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
  if (!Number.isFinite(expiresAt)) return false;
  return Date.now() < expiresAt;
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_CONSOLE_PASSWORD?.trim();
  if (!expected || !password) return false;
  return timingSafeEqual(password, expected);
}
