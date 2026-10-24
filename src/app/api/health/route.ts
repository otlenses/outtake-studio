import { getSiteSettings } from "@/lib/server/db";

export const dynamic = "force-dynamic";

// A tiny database read. It is called
//  - once a day by a Vercel cron job (see vercel.json), which keeps a free Supabase project from being paused, and
//  - every 30 minutes by the "Uptime check" GitHub workflow, which emails the owner if the site or database is down.
// It returns nothing but ok / not ok, so it is safe to leave open.
export async function GET() {
  try {
    await getSiteSettings();
    return Response.json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    console.error("[health] database check failed", err);
    return Response.json({ ok: false }, { status: 503 });
  }
}
