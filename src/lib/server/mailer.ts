import nodemailer from "nodemailer";
import { getSiteSettings, SELF_PICKUP_ADDRESS, type MerchOrder, type OrderRequest } from "./db";

// Sends the admin a notification email so an order request is never overlooked
// even if nobody happens to be watching the admin panel. Configured entirely
// via env vars — if SMTP isn't set up yet, this silently no-ops rather than
// blocking order submission.
function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendOrderNotificationEmail(order: OrderRequest): Promise<void> {
  const { notifications } = await getSiteSettings();
  if (!notifications.emailEnabled) return;
  const notifyTo = notifications.notifyEmail || process.env.NOTIFY_EMAIL;
  const transport = getTransport();
  if (!transport || !notifyTo) {
    console.warn(
      "[mailer] SMTP or notification email not configured — skipping order notification email."
    );
    return;
  }

  const itemLines = order.items
    .map((i) => `  • ${i.productName} x${i.quantity} — RM ${i.subtotal.toFixed(2)}`)
    .join("\n");

  const text = [
    `New quote request: ${order.orderNumber}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    order.customerEmail && `Email: ${order.customerEmail}`,
    order.companyName && `Company: ${order.companyName}`,
    order.rentalStartDate && `Start date: ${order.rentalStartDate}`,
    order.rentalEndDate && `End date: ${order.rentalEndDate}`,
    "",
    "Items:",
    itemLines,
    "",
    "View in admin: /admin/orders",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: notifyTo,
      subject: `New quote request — ${order.orderNumber}`,
      text,
    });
  } catch (err) {
    console.error("[mailer] Failed to send order notification email", err);
  }
}

// Sends the customer a receipt confirming their order request was received,
// so they know it went through without waiting on a reply.
export async function sendCustomerConfirmationEmail(order: OrderRequest): Promise<void> {
  const transport = getTransport();
  if (!transport || !order.customerEmail) return;

  const itemLines = order.items
    .map((i) => `  • ${i.productName} x${i.quantity} — RM ${i.subtotal.toFixed(2)}`)
    .join("\n");

  const text = [
    `Hi ${order.customerName || "there"},`,
    "",
    `We've received your quote request ${order.orderNumber}. We'll confirm availability and pricing with you directly.`,
    "",
    "Items requested:",
    itemLines,
    "",
    order.rentalStartDate && `Start date: ${order.rentalStartDate}`,
    order.rentalEndDate && `End date: ${order.rentalEndDate}`,
    "",
    "Thanks for choosing Out Take Studio.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: order.customerEmail,
      subject: `Quote request received — ${order.orderNumber}`,
      text,
    });
  } catch (err) {
    console.error("[mailer] Failed to send customer confirmation email", err);
  }
}

// Sends the admin a notification email for a new merchandise order, mirroring
// sendOrderNotificationEmail for the rental flow.
export async function sendMerchOrderNotificationEmail(order: MerchOrder): Promise<void> {
  const { notifications } = await getSiteSettings();
  if (!notifications.emailEnabled) return;
  const notifyTo = notifications.notifyEmail || process.env.NOTIFY_EMAIL;
  const transport = getTransport();
  if (!transport || !notifyTo) {
    console.warn(
      "[mailer] SMTP or notification email not configured — skipping merch order notification email."
    );
    return;
  }

  const text = [
    `New merchandise order: ${order.orderNumber}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    order.customerEmail && `Email: ${order.customerEmail}`,
    order.companyName && `Company: ${order.companyName}`,
    "",
    `Item: ${order.productName}`,
    `Size: ${order.size}`,
    `Quantity: ${order.quantity}`,
    `Subtotal: RM ${order.subtotal.toFixed(2)}`,
    "",
    `Payment method: ${order.paymentMethod === "QR_PAYMENT" ? "QR payment" : "Bank transfer"}`,
    order.paymentSlipUrl && `Payment slip: ${order.paymentSlipUrl}`,
    order.notes && `Notes: ${order.notes}`,
    "",
    "View in admin: /admin/merch-orders",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: notifyTo,
      subject: `New merchandise order — ${order.orderNumber}`,
      text,
    });
  } catch (err) {
    console.error("[mailer] Failed to send merch order notification email", err);
  }
}

// Sends the customer a receipt confirming their merchandise order was received.
export async function sendMerchCustomerConfirmationEmail(order: MerchOrder): Promise<void> {
  const transport = getTransport();
  if (!transport || !order.customerEmail) return;

  const text = [
    `Hi ${order.customerName || "there"},`,
    "",
    `We've received your order ${order.orderNumber}. We'll verify your payment and confirm once it's ready for pickup.`,
    "",
    `Item: ${order.productName}`,
    `Size: ${order.size}`,
    `Quantity: ${order.quantity}`,
    `Total: RM ${order.subtotal.toFixed(2)}`,
    "",
    "Pickup location:",
    SELF_PICKUP_ADDRESS,
    "",
    "Thanks for choosing Out Take Studio.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: order.customerEmail,
      subject: `Order received — ${order.orderNumber}`,
      text,
    });
  } catch (err) {
    console.error("[mailer] Failed to send merch customer confirmation email", err);
  }
}

/** Returns true if the email was actually sent. */
export async function sendPaymentOtpEmail(to: string, code: string): Promise<boolean> {
  const transport = getTransport();
  if (!transport) return false;
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Out Take admin verification code: ${code}`,
      text: [
        `Your verification code to change payment settings is: ${code}`,
        "",
        "It expires in 5 minutes. If you did not request this, someone is trying to edit your payment details — do not share this code.",
      ].join("\n"),
    });
    return true;
  } catch (err) {
    console.error("[mailer] Failed to send payment OTP email:", err);
    return false;
  }
}
