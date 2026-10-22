import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/session";
import { getSupabase, isSupabaseEnabled, SLIP_BUCKET } from "@/lib/server/supabase";

// Customers' payment slips live in a private bucket. Only a signed-in admin gets a short-lived link to one.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) return new NextResponse("Unauthorized", { status: 401 });
  if (!isSupabaseEnabled()) return new NextResponse("Not found", { status: 404 });

  const { path } = await params;
  const filename = path.join("/");
  if (!/^[A-Za-z0-9._-]+$/.test(filename)) return new NextResponse("Not found", { status: 404 });

  const { data, error } = await getSupabase().storage.from(SLIP_BUCKET).createSignedUrl(filename, 60);
  if (error || !data) return new NextResponse("Not found", { status: 404 });

  const response = NextResponse.redirect(data.signedUrl);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
