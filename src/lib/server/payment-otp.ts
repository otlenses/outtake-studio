import { randomInt, timingSafeEqual } from "node:crypto";
import { getPaymentOtp, setPaymentOtp } from "./db";
import { sendPaymentOtpEmail } from "./mailer";
import { hashOtpCode } from "./session";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 1)}${"*".repeat(Math.max(1, name.length - 1))}@${domain}`;
}

export type OtpRequestResult = { ok: boolean; error?: string; sentTo?: string; devMode?: boolean };

// The owner's address comes only from the server environment — it is deliberately
// not editable in the admin UI, otherwise anyone logged in could redirect the code.
export async function issuePaymentOtp(): Promise<OtpRequestResult> {
  const existing = await getPaymentOtp();
  if (existing && Date.now() - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    return { ok: false, error: "Please wait a few seconds before requesting another code." };
  }

  const ownerEmail = process.env.OWNER_EMAIL?.trim();
  const isProd = process.env.NODE_ENV === "production";
  if (!ownerEmail && isProd) {
    return { ok: false, error: "Owner email is not configured (OWNER_EMAIL)." };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await setPaymentOtp({
    hash: hashOtpCode(code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: Date.now(),
  });

  const sent = ownerEmail ? await sendPaymentOtpEmail(ownerEmail, code) : false;
  if (sent && ownerEmail) return { ok: true, sentTo: maskEmail(ownerEmail) };

  if (isProd) {
    return { ok: false, error: "Could not send the verification email. Check the SMTP settings." };
  }
  // Development fallback: no owner email / SMTP yet, so print the code in the server terminal.
  console.log(`[payment-otp] DEV MODE — verification code: ${code}`);
  return { ok: true, sentTo: ownerEmail ? maskEmail(ownerEmail) : "the server terminal", devMode: true };
}

export async function checkPaymentOtp(code: string): Promise<{ ok: boolean; error?: string }> {
  const state = await getPaymentOtp();
  if (!state || Date.now() > state.expiresAt) {
    return { ok: false, error: "This code has expired. Please request a new one." };
  }
  if (state.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Too many attempts. Please request a new code." };
  }

  const given = Buffer.from(hashOtpCode(code.trim()));
  const expected = Buffer.from(state.hash);
  const match = given.length === expected.length && timingSafeEqual(given, expected);
  if (!match) {
    await setPaymentOtp({ ...state, attempts: state.attempts + 1 });
    return { ok: false, error: "Incorrect code." };
  }
  await setPaymentOtp(null); // single use
  return { ok: true };
}
