/**
 * Change the admin login (email + password) stored in Supabase.
 *
 *   npm run admin:set
 *
 * It asks for the new email and password in the terminal (the password is not shown while you type).
 * The admin account lives in the database, so the ADMIN_EMAIL / ADMIN_PASSWORD environment variables only
 * matter for the very first account — after that, use this script to change it.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../src/lib/server/passwords";

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

function prompt(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // don't echo the characters being typed
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
        if (s.startsWith(question)) process.stdout.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function main() {
  await loadEnvLocal();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase.from("records").select("id,data").eq("collection", "adminUsers");
  if (error) throw new Error(`Could not read admin users: ${error.message}`);
  if (!data || data.length === 0) throw new Error("No admin account exists yet. Open the site once so it is created, then retry.");
  if (data.length > 1) throw new Error(`Found ${data.length} admin accounts; this script only handles a single one.`);
  const current = data[0] as { id: string; data: { email: string; passwordHash: string } };
  console.log(`Current admin email: ${current.data.email}\n`);

  const email = (await prompt("New admin email (press Enter to keep the current one): ")) || current.data.email;
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("That does not look like an email address.");
  const password = await prompt("New password (at least 10 characters): ", true);
  if (password.length < 10) throw new Error("The password must be at least 10 characters.");
  const again = await prompt("Type the new password again: ", true);
  if (again !== password) throw new Error("The two passwords do not match — nothing was changed.");

  const { error: updateError } = await supabase
    .from("records")
    .update({ data: { ...current.data, email, passwordHash: hashPassword(password) }, updated_at: new Date().toISOString() })
    .eq("collection", "adminUsers")
    .eq("id", current.id);
  if (updateError) throw new Error(`Could not save: ${updateError.message}`);
  console.log(`\nDone. You can now log in to /admin with ${email} and the new password.`);
}

main().catch((err) => {
  console.error("\n" + (err instanceof Error ? err.message : err));
  process.exit(1);
});
