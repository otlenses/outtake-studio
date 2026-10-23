/**
 * Sends one test email with the SMTP settings from .env.local, to check they work.
 *   npm run test:email -- someone@example.com
 * Prints the real error if sending fails (wrong app password, blocked login, ...).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

async function loadEnvLocal() {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local */
  }
}

async function main() {
  await loadEnvLocal();
  const to = process.argv[2] || process.env.NOTIFY_EMAIL;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) throw new Error("SMTP_HOST / SMTP_USER / SMTP_PASS are not all set in .env.local.");
  if (!to) throw new Error("Give a recipient: npm run test:email -- someone@example.com");

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transport.verify();
  const info = await transport.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: "Out Take Studio — test email",
    text: "If you can read this, the website can send email.",
  });
  console.log(`Sent to ${to}. Server said: ${info.response}`);
}

main().catch((err) => {
  console.error("\nSending failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
