/**
 * One-time import of the local data (data/db.json + public/uploads) into Supabase.
 *
 *   1. Run supabase/schema.sql in the Supabase SQL editor first.
 *   2. Put SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. npm run backup                       (always take a backup first)
 *   4. npm run import:supabase              (dry run: shows what would be imported)
 *      npm run import:supabase -- --apply   (really imports)
 *
 * Safe to re-run: records are upserted by id, files are uploaded with upsert. It refuses to run if the
 * database already contains data unless you also pass --force.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseBackend } from "../src/lib/server/supabase";
import { createSupabaseStore } from "../src/lib/server/store";

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");
const ROOT = process.cwd();

async function loadEnvLocal() {
  try {
    const raw = await fs.readFile(path.join(ROOT, ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local */
  }
}

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", gif: "image/gif", mp4: "video/mp4",
};

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function main() {
  await loadEnvLocal();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");

  const raw = await fs.readFile(path.join(ROOT, "data", "db.json"), "utf-8");
  const db = JSON.parse(raw) as Record<string, unknown>;
  const count = (k: string) => (Array.isArray(db[k]) ? (db[k] as unknown[]).length : 0);
  console.log("Local data:");
  for (const k of ["adminUsers", "orders", "merchOrders", "enquiries", "gearProducts", "packageProducts", "portfolioProjects", "merchProducts"]) {
    console.log(`  ${k.padEnd(18)} ${count(k)}`);
  }

  const uploadRoot = path.join(ROOT, "public", "uploads");
  const files = await walk(uploadRoot);
  console.log(`Uploaded files: ${files.length}`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const store = createSupabaseStore(createSupabaseBackend(supabase));

  const existing = await store.load();
  if (existing && !FORCE) {
    throw new Error("The Supabase database already has data. Re-run with --force to import over it.");
  }
  if (!APPLY) {
    console.log("\nDry run only — nothing was changed. Re-run with --apply to import.");
    return;
  }

  // 1. files -> Storage. Payment slips go to the private bucket; everything else to the public one.
  const urlMap = new Map<string, string>();
  for (const file of files) {
    const rel = path.relative(uploadRoot, file).split(path.sep).join("/"); // e.g. packages/123.jpg
    const isSlip = rel.startsWith("payment-slips/");
    const bucket = isSlip ? "payment-slips" : "uploads";
    const objectPath = isSlip ? rel.slice("payment-slips/".length) : rel;
    const ext = path.extname(file).slice(1).toLowerCase();
    const body = await fs.readFile(file);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, body, { contentType: CONTENT_TYPES[ext] ?? "application/octet-stream", upsert: true });
    if (error) throw new Error(`Upload failed for ${rel}: ${error.message}`);
    const newUrl = isSlip
      ? `/api/payment-slip/${objectPath}`
      : supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
    urlMap.set(`/uploads/${rel}`, newUrl);
  }
  console.log(`Uploaded ${files.length} files to Storage.`);

  // 2. rewrite /uploads/... URLs inside the data, then save everything
  let json = JSON.stringify(db);
  for (const [oldUrl, newUrl] of urlMap) json = json.split(JSON.stringify(oldUrl).slice(1, -1)).join(newUrl);
  const rewritten = JSON.parse(json) as Record<string, unknown>;
  await store.save(rewritten);
  console.log("Data imported. Done.");
}

main().catch((err) => {
  console.error("\nImport failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
