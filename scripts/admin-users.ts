/**
 * Manage extra admin logins stored in Supabase (e.g. a separate login for a client who is trying the admin).
 *
 *   npm run admin:list                 show the admin emails
 *   npm run admin:add                  add another admin (asks for email + password)
 *   npm run admin:remove               remove an admin (asks which email); the last admin can't be removed
 *
 * Passwords are typed in the terminal and are not shown. Use `npm run admin:set` to change your own login.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { randomUUID } from "node:crypto";
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

type Row = { id: string; position: number; data: { id: string; email: string; passwordHash: string } };

async function main() {
  await loadEnvLocal();
  const command = process.argv[2];
  if (!["list", "add", "remove"].includes(command ?? "")) throw new Error("Use: list, add or remove.");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("records")
    .select("id,position,data")
    .eq("collection", "adminUsers")
    .order("position");
  if (error) throw new Error(`Could not read admin users: ${error.message}`);
  const admins = (data ?? []) as Row[];

  if (command === "list") {
    console.log(admins.length ? admins.map((a) => `  ${a.data.email}`).join("\n") : "No admin accounts.");
    return;
  }

  if (command === "add") {
    const email = await prompt("Email for the new admin login: ");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("That does not look like an email address.");
    if (admins.some((a) => a.data.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An admin with that email already exists.");
    }
    const password = await prompt("Password (at least 10 characters): ", true);
    if (password.length < 10) throw new Error("The password must be at least 10 characters.");
    const again = await prompt("Type the password again: ", true);
    if (again !== password) throw new Error("The two passwords do not match — nothing was changed.");
    const id = randomUUID();
    const position = admins.reduce((max, a) => Math.max(max, a.position), -1) + 1;
    const { error: insertError } = await supabase.from("records").insert({
      collection: "adminUsers",
      id,
      position,
      data: { id, email, passwordHash: hashPassword(password) },
    });
    if (insertError) throw new Error(`Could not save: ${insertError.message}`);
    console.log(`\nDone. ${email} can now log in to /admin.`);
    return;
  }

  // remove
  console.log("Admin logins:");
  admins.forEach((a) => console.log(`  ${a.data.email}`));
  if (admins.length <= 1) throw new Error("\nThere is only one admin — it can't be removed.");
  const email = await prompt("\nEmail to remove: ");
  const target = admins.find((a) => a.data.email.toLowerCase() === email.toLowerCase());
  if (!target) throw new Error("No admin with that email.");
  const { error: deleteError } = await supabase
    .from("records")
    .delete()
    .eq("collection", "adminUsers")
    .eq("id", target.id);
  if (deleteError) throw new Error(`Could not remove: ${deleteError.message}`);
  console.log(`\nDone. ${target.data.email} can no longer log in.`);
}

main().catch((err) => {
  console.error("\n" + (err instanceof Error ? err.message : err));
  process.exit(1);
});
