import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ot_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";

function sign(value: string): string {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

export type SessionPayload = { email: string; exp: number };

export function createSessionToken(email: string): string {
  const payload: SessionPayload = { email, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8")) as SessionPayload;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;

// Short-lived, single-purpose token proving the owner just verified an emailed code.
export const PAYMENT_UNLOCK_COOKIE = "ot_payment_unlock";
export const PAYMENT_UNLOCK_SECONDS = 10 * 60;

export function createPaymentUnlockToken(): string {
  const payload = { purpose: "payment", exp: Date.now() + PAYMENT_UNLOCK_SECONDS * 1000 };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyPaymentUnlockToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;
  const expectedBuf = Buffer.from(sign(payloadB64));
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8")) as {
      purpose?: string;
      exp?: number;
    };
    return payload.purpose === "payment" && typeof payload.exp === "number" && Date.now() < payload.exp;
  } catch {
    return false;
  }
}

export function hashOtpCode(code: string): string {
  return createHmac("sha256", SESSION_SECRET).update(`otp:${code}`).digest("hex");
}

// Cookie that remembers the visitor passed the client-preview password page.
export const PREVIEW_COOKIE = "ot_preview";
export const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function createPreviewToken(): string {
  const payload = { purpose: "preview", exp: Date.now() + PREVIEW_COOKIE_MAX_AGE * 1000 };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyPreviewToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;
  const expectedBuf = Buffer.from(sign(payloadB64));
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8")) as {
      purpose?: string;
      exp?: number;
    };
    return payload.purpose === "preview" && typeof payload.exp === "number" && Date.now() < payload.exp;
  } catch {
    return false;
  }
}
