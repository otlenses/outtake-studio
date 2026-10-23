import { getSiteSettings } from "@/lib/server/db";

export const dynamic = "force-dynamic";

// Tiny database read, hit once a day by a Vercel cron job (see vercel.json). It keeps a free Supabase project
// from being paused for inactivity, and doubles as a "is the site + database up?" check.
// If CRON_SECRET is set, only requests carrying it (Vercel adds it to cron calls) are answered.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    await getSiteSettings();
    return Response.json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    console.error("[health] database check failed", err);
    return Response.json({ ok: false }, { status: 503 });
  }
}
