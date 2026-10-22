/**
 * Backup of everything in Supabase to your computer: all records and settings (as one db.json, the same shape
 * the local file store uses) plus every file in the two storage buckets.
 *
 *   npm run backup:supabase                 (saves to "Project 2/Backups/outtake-supabase-<date>")
 *   BACKUP_DIR=/some/folder npm run backup:supabase
 *
 * It only reads from Supabase. Keep the backup folder private: it contains customer details and payment slips.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

async function downloadBucket(supabase: SupabaseClient, bucket: string, folder: string, outDir: string): Promise<number> {
  let count = 0;
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });
  if (error) throw new Error(`Could not list ${bucket}/${folder}: ${error.message}`);
  for (const entry of data ?? []) {
    const rel = folder ? `${folder}/${entry.name}` : entry.name;
    if (!entry.id) {
      count += await downloadBucket(supabase, bucket, rel, outDir); // a folder
      continue;
    }
    const { data: blob, error: dlError } = await supabase.storage.from(bucket).download(rel);
    if (dlError || !blob) throw new Error(`Could not download ${bucket}/${rel}: ${dlError?.message}`);
    const target = path.join(outDir, rel);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await blob.arrayBuffer()));
    count++;
  }
  return count;
}

async function main() {
  await loadEnvLocal();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const base = process.env.BACKUP_DIR ?? path.join(path.dirname(process.cwd()), "Backups");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const out = path.join(base, `outtake-supabase-${stamp}`);
  await fs.mkdir(out, { recursive: true });

  const db: Record<string, unknown> = {};
  const counts: Record<string, number> = {};
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("records")
      .select("collection,position,data")
      .order("collection")
      .order("position")
      .range(from, from + 999);
    if (error) throw new Error(`Could not read records: ${error.message}`);
    for (const r of data ?? []) {
      (db[r.collection] ??= []) as unknown[];
      (db[r.collection] as unknown[]).push(r.data);
      counts[r.collection] = (counts[r.collection] ?? 0) + 1;
    }
    if ((data ?? []).length < 1000) break;
  }
  const { data: settings, error: settingsError } = await supabase.from("settings").select("key,data");
  if (settingsError) throw new Error(`Could not read settings: ${settingsError.message}`);
  for (const s of settings ?? []) if (s.key !== "meta") db[s.key] = (s.data as { v: unknown }).v;
  await fs.writeFile(path.join(out, "db.json"), JSON.stringify(db, null, 2));

  const publicFiles = await downloadBucket(supabase, "uploads", "", path.join(out, "uploads"));
  const slipFiles = await downloadBucket(supabase, "payment-slips", "", path.join(out, "payment-slips"));

  console.log("Backup saved to:", out);
  console.log("Records:", JSON.stringify(counts));
  console.log(`Files: ${publicFiles} images, ${slipFiles} payment slips`);
}

main().catch((err) => {
  console.error("\nBackup failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
