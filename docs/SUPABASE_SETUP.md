# Moving the data to Supabase

This branch (`supabase-migration`) lets the app keep its data in Supabase instead of `data/db.json`.
Nothing changes until `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set — without them the app keeps
using the local file exactly as before.

## 1. Create the project
1. Sign up at supabase.com (free) and create a new project. Pick the region closest to Malaysia (Singapore).
2. Save the database password it asks for somewhere safe (a password manager).

## 2. Create the tables and storage buckets
Dashboard -> **SQL Editor** -> New query -> paste everything from `supabase/schema.sql` -> **Run**.
This creates the `records` and `settings` tables and two storage buckets (`uploads` public, `payment-slips` private).

## 3. Get the two keys
Dashboard -> **Project Settings -> API**:
- **Project URL** -> `SUPABASE_URL`
- **service_role** key (click "Reveal") -> `SUPABASE_SERVICE_ROLE_KEY`

The service_role key can read and write everything. Keep it secret: only in `.env.local` and Vercel's
Environment Variables. Never paste it in chat, never commit it.

## 4. Test locally first
Add both lines to `.env.local`, then:
```bash
npm run backup                       # always back up first
npm run import:supabase              # dry run, shows what would be imported
npm run import:supabase -- --apply   # really imports data + uploaded files
```
Restart `npm run dev`. The site and admin should look exactly the same, but now read and write Supabase
(check Dashboard -> Table Editor -> `records`).

## 5. Vercel
Add the same two variables in Vercel -> Settings -> Environment Variables, then redeploy.
The admin on Vercel then keeps its data for real.

## Notes
- Payment slips are in a private bucket. In the admin they open through `/api/payment-slip/...`, which only
  works while you are logged in as admin.
- To go back to the local file, remove the two variables.
- Take regular backups: Dashboard -> Database -> Backups (paid plans), or export tables from the Table Editor.
