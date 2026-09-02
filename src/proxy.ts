import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function proxy(request: NextRequest) {
  if (DISABLED) return NextResponse.next();

  const host = request.nextUrl.hostname;
  if (LOCAL_HOSTS.has(host)) return NextResponse.next();

  const header = request.headers.get("authorization");

  if (header?.startsWith("Basic ")) {
    const [user, pass] = atob(header.slice(6)).split(":");
    if (user === USER && pass === PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Out Take Studio preview"' },
  });
}

export const config = {
  // Run on every path except Next's build assets and image optimizer output.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
