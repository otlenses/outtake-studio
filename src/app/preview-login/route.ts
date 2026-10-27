import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { PREVIEW_COOKIE, PREVIEW_COOKIE_MAX_AGE, createPreviewToken } from "@/lib/server/session";

// The password page shown to visitors of the client preview (see src/proxy.ts).
const USER = process.env.PREVIEW_USER ?? "outtake";
const PASSWORD = process.env.PREVIEW_PASSWORD ?? "preview2026";

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Only allow redirects to a path on this site. */
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/preview-login") ? value : "/";
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function page(next: string, error?: string, status = 200) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Out Take Studio — Preview</title>
<style>
  *{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f1f0ee;
  font-family:"Avenir Next",Avenir,system-ui,-apple-system,"Segoe UI",sans-serif;color:#0b0b0c;padding:24px}
  .card{width:100%;max-width:380px;background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
  p.eyebrow{margin:0 0 8px;text-align:center;font-size:11px;letter-spacing:.3em;color:#8a8a87;text-transform:uppercase}
  h1{margin:0 0 8px;text-align:center;font-size:24px;font-weight:800;letter-spacing:-.01em}
  p.sub{margin:0 0 24px;text-align:center;font-size:14px;color:#6b6b68}
  label{display:block;margin-bottom:16px;font-size:12px;letter-spacing:.08em;color:#8a8a87;text-transform:uppercase}
  input{display:block;width:100%;margin-top:6px;border:0;border-bottom:1px solid #c9c8c4;padding:10px 0;font-size:16px;background:transparent;outline:none}
  input:focus{border-bottom-color:#0b0b0c}
  button{width:100%;margin-top:8px;border:0;border-radius:999px;background:#f4c11b;color:#0b0b0c;padding:14px;font-size:14px;font-weight:700;cursor:pointer}
  .err{margin:0 0 16px;color:#c0392b;font-size:13px}
</style></head><body><main class="card">
<p class="eyebrow">Out Take Studio</p><h1>Client preview</h1><p class="sub">Enter the preview login you were given to view the site.</p>
<form method="post" action="/preview-login" autocomplete="on">
  <input type="hidden" name="next" value="${escapeHtml(next)}">
  ${error ? `<p class="err" role="alert">${escapeHtml(error)}</p>` : ""}
  <label>Username<input name="user" autocomplete="username" autocapitalize="none" required autofocus></label>
  <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
  <button type="submit">View site</button>
</form></main></body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  return page(safeNext(new URL(request.url).searchParams.get("next")));
}

export async function POST(request: Request) {
  const form = await request.formData();
  const next = safeNext(String(form.get("next") ?? ""));
  const user = String(form.get("user") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!same(user, USER) || !same(password, PASSWORD)) {
    return page(next, "That username or password is not right. Please try again.", 401);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(PREVIEW_COOKIE, createPreviewToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PREVIEW_COOKIE_MAX_AGE,
  });
  return response;
}
