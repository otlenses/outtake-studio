import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PREVIEW_COOKIE, SESSION_COOKIE, verifyPreviewToken, verifySessionToken } from "@/lib/server/session";

// Password gate for the client preview deployment. Visitors without the preview cookie are sent to /preview-login,
// where they type PREVIEW_USER / PREVIEW_PASSWORD once (the fallback values below let it work with zero config).
// A browser "Authorization: Basic" header with the same credentials is still accepted, for scripts and old bookmarks.
const USER = process.env.PREVIEW_USER ?? "outtake";
const PASSWORD = process.env.PREVIEW_PASSWORD ?? "preview2026";

// Allow turning the gate off entirely via env without touching code.
const DISABLED = process.env.PREVIEW_AUTH_DISABLED === "true";

// Never prompt during local development.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function checkPreviewAuth(request: NextRequest): NextResponse | null {
  if (DISABLED) return null;

  const { pathname, search } = request.nextUrl;
  // the daily health check (Vercel cron, uptime monitor) carries no password; the preview page itself must stay open
  if (pathname === "/api/health" || pathname === "/preview-login") return null;

  // the real Host header (nextUrl can say "localhost" in development); local and home-network addresses skip the gate
  const host = (request.headers.get("host") ?? request.nextUrl.hostname).split(":")[0];
  if (LOCAL_HOSTS.has(host) || /^(192\.168|10)\./.test(host) || host.endsWith(".local")) return null;

  if (verifyPreviewToken(request.cookies.get(PREVIEW_COOKIE)?.value)) return null;

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const colon = decoded.indexOf(":");
    if (colon !== -1 && decoded.slice(0, colon) === USER && decoded.slice(colon + 1) === PASSWORD) {
      return null;
    }
  }

  // Page loads go to the password page; everything else (images, data requests, form posts) just gets a 401.
  const dest = request.headers.get("sec-fetch-dest");
  if (request.method === "GET" && (dest === null || dest === "document")) {
    const login = new URL("/preview-login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  return new NextResponse("Authentication required.", { status: 401 });
}

// Admin panel auth gate — everything under /admin except the login page
// itself requires a valid signed session cookie (see lib/server/session.ts).
function checkAdminAuth(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") return null;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (verifySessionToken(token)) return null;

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export function proxy(request: NextRequest) {
  const previewAuthResponse = checkPreviewAuth(request);
  if (previewAuthResponse) return previewAuthResponse;

  const adminAuthResponse = checkAdminAuth(request);
  if (adminAuthResponse) return adminAuthResponse;

  return NextResponse.next();
}

export const config = {
  // Run on every path except Next's build assets and image optimizer output.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
