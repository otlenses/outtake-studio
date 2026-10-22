import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Backend, RecordRow, SettingRow } from "./store";

/** True when the Supabase credentials are configured (then data + uploads live in Supabase, not on disk). */
export function isSupabaseEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let client: SupabaseClient | null = null;

/** Server-only client using the service-role key — never import this from a client component. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}

export const PUBLIC_BUCKET = "uploads";
export const SLIP_BUCKET = "payment-slips";

function check<T>(result: { data: T | null; error: { message: string } | null }, what: string): T | null {
  if (result.error) throw new Error(`Supabase ${what} failed: ${result.error.message}`);
  return result.data;
}

/** Database calls for the Supabase store (tables created by supabase/schema.sql). */
export function createSupabaseBackend(supabase: SupabaseClient): Backend {
  const PAGE = 1000; // Supabase returns at most 1000 rows per request
  return {
    async fetchRecords(collections) {
      if (collections.length === 0) return [];
      const rows: RecordRow[] = [];
      for (let from = 0; ; from += PAGE) {
        const page =
          check(
            await supabase
              .from("records")
              .select("collection,id,position,data")
              .in("collection", collections)
              .order("collection")
              .order("position")
              .range(from, from + PAGE - 1),
            "read records"
          ) ?? [];
        rows.push(...(page as RecordRow[]));
        if (page.length < PAGE) break;
      }
      return rows;
    },
    async fetchSettings(keys) {
      if (keys.length === 0) return [];
      const data = check(await supabase.from("settings").select("key,data").in("key", keys), "read settings");
      return (data ?? []) as SettingRow[];
    },
    async upsertRecords(rows) {
      const now = new Date().toISOString();
      check(
        await supabase
          .from("records")
          .upsert(rows.map((r) => ({ ...r, updated_at: now })), { onConflict: "collection,id" }),
        "save records"
      );
    },
    async deleteRecords(collection, ids) {
      check(await supabase.from("records").delete().eq("collection", collection).in("id", ids), "delete records");
    },
    async upsertSettings(rows) {
      const now = new Date().toISOString();
      check(
        await supabase.from("settings").upsert(rows.map((r) => ({ ...r, updated_at: now })), { onConflict: "key" }),
        "save settings"
      );
    },
  };
}
