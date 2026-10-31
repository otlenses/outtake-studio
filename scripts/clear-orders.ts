/**
 * Delete ALL order requests, merchandise orders and enquiries from Supabase, plus the stored payment slips.
 * Products, packages, banners and settings are left alone. Invoice numbers restart at INV-R0001 / INV-M0001.
 *
 *   npm run backup:supabase        (take a backup first!)
 *   npm run clear:orders           (asks you to type DELETE)
 *   npm run clear:orders -- --yes  (no question)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { createClient } from "@supabase/supabase-js";

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

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (a) => {
      rl.close();
      resolve(a.trim());
    });
  });
}

async function main() {
  await loadEnvLocal();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const count = async (collection: string) => {
    const { count: n, error } = await supabase
      .from("records")
      .select("id", { count: "exact", head: true })
      .eq("collection", collection);
    if (error) throw new Error(`Could not count ${collection}: ${error.message}`);
    return n ?? 0;
  };
  const slips = await supabase.storage.from("payment-slips").list("", { limit: 1000 });
  if (slips.error) throw new Error(`Could not list payment slips: ${slips.error.message}`);
  const slipFiles = (slips.data ?? []).filter((f) => f.id).map((f) => f.name);

  const orders = await count("orders");
  const merchOrders = await count("merchOrders");
  const enquiries = await count("enquiries");
  console.log(
    `About to delete: ${orders} order requests, ${merchOrders} merchandise orders, ${enquiries} enquiries, ${slipFiles.length} payment slips.`
  );

  if (!process.argv.includes("--yes")) {
    const answer = await ask('Type DELETE to continue: ');
    if (answer !== "DELETE") {
      console.log("Cancelled — nothing was deleted.");
      return;
    }
  }

  for (const collection of ["orders", "merchOrders", "enquiries"]) {
    const { error } = await supabase.from("records").delete().eq("collection", collection);
    if (error) throw new Error(`Could not delete ${collection}: ${error.message}`);
  }
  if (slipFiles.length) {
    const { error } = await supabase.storage.from("payment-slips").remove(slipFiles);
    if (error) throw new Error(`Could not delete payment slips: ${error.message}`);
  }
  console.log(
    `Deleted ${orders} order requests, ${merchOrders} merchandise orders, ${enquiries} enquiries and ${slipFiles.length} payment slips.`
  );
  console.log(
    `Remaining: ${await count("orders")} orders, ${await count("merchOrders")} merchandise orders, ${await count("enquiries")} enquiries.`
  );
}

main().catch((err) => {
  console.error("\n" + (err instanceof Error ? err.message : err));
  process.exit(1);
});
