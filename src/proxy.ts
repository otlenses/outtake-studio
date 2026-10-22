import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/session";

// Simple HTTP Basic Auth gate for the client preview deployment.
// Set PREVIEW_USER / PREVIEW_PASSWORD as environment variables in the host
// (e.g. Vercel project settings). The fallback values below let it work with
// zero config while the site is only a work-in-progress preview.
const USER = process.env.PREVIEW_USER ?? "outtake";
const PASSWORD = process.env.PREVIEW_PASSWORD ?? "preview2026";

// Allow turning the gate off entirely via env without touching code.
const DISABLED = process.env.PREVIEW_AUTH_DISABLED === "true";

// Never prompt during local development.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function checkPreviewAuth(request: NextRequest): NextResponse | null {
  if (DISABLED) return null;

  const host = request.nextUrl.hostname;
  if (LOCAL_HOSTS.has(host)) return null;

  const header = request.headers.get("authorization");

  if (header?.startsWith("Basic ")) {
    const [user, pass] = atob(header.slice(6)).split(":");
    if (user === USER && pass === PASSWORD) {
      return null;
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Out Take Studio preview"' },
  });
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
