import crypto from "crypto";

// Signed-cookie session scheme — no JWT library, no session table, ported
// from the santa-cruz-tree-site admin auth pattern (see its lib/adminAuth.ts).
// Deliberately DB-free so middleware can verify a session on every request
// without a database round trip; only login itself touches the DB (to check
// the password hash).
//
// Token format: base64url(JSON payload) + "." + base64url(HMAC-SHA256 of the
// payload, keyed by ADMIN_SESSION_SECRET). No user id in the payload — there
// is exactly one admin identity (a shared password), same as tree-site.

export const SESSION_COOKIE = "admin_session";
export const CSRF_COOKIE = "admin_csrf";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours, matches tree-site

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

interface SessionPayload {
  iat: number;
  exp: number;
}

export function createSessionToken(maxAgeSeconds = SESSION_MAX_AGE_SECONDS): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { iat: now, exp: now + maxAgeSeconds };
  const payloadBuf = Buffer.from(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", getSecret()).update(payloadBuf).digest();
  return `${base64url(payloadBuf)}.${base64url(sig)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;

  let payloadBuf: Buffer;
  try {
    payloadBuf = Buffer.from(payloadB64, "base64url");
  } catch {
    return false;
  }

  const expectedSig = crypto.createHmac("sha256", getSecret()).update(payloadBuf).digest();
  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(sigB64, "base64url");
  } catch {
    return false;
  }
  if (providedSig.length !== expectedSig.length) return false;
  if (!crypto.timingSafeEqual(providedSig, expectedSig)) return false;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(payloadBuf.toString());
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp < now) return false;

  return true;
}

export function createCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
