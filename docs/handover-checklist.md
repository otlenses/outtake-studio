# Out Take Studio: go-live and handover checklist

Plan: the client owns every account and pays for it. The developer is invited as a **Member** on the client's Vercel Team for the go-live period, then removed (or downgraded to Viewer).

Never paste passwords, API keys or card numbers into chat or email. Names of settings are listed below; values stay in the service's own dashboard.

Some menu names and prices below are from memory and may have changed. If a screen looks different, follow the screen.

---

## 0. Before the call

- [ ] Client has a card for Vercel (Pro is about US$20/month per deploying seat; check Billing for the real amount).
- [ ] Client has a card for the domain (.com is about US$10/year).
- [ ] Client has the email inbox they want to use for notifications (currently `ot.studio26@gmail.com`).
- [ ] Developer has a working local copy and the latest code pushed to GitHub.
- [ ] Developer has run `npm run backup:supabase` and kept the file.

## 1. Client creates the accounts

**Cloudflare (domain)**
- [ ] Sign up at dash.cloudflare.com and verify the email.
- [ ] Domain Registration, Register Domains, search, buy a `.com`.
- [ ] Use real registrant details. Keep auto-renew on. Keep WHOIS privacy on.

**Vercel (hosting)**
- [ ] Sign up at vercel.com with the client's own email.
- [ ] Upgrade the Team to Pro and add the client's card.
- [ ] Settings, Members, Invite: developer's email, role **Member**.

**GitHub (code)**
- [ ] Sign up at github.com.
- [ ] Developer: repo Settings, Transfer ownership, enter the client's GitHub username.
- [ ] Client accepts the transfer from the email.
- [ ] Client adds the developer as a Collaborator with write access (only if the developer will keep editing after go-live; otherwise skip).

**Supabase (database and image storage)**
- [ ] Sign up at supabase.com and create an Organization.
- [ ] Developer: Project Settings, find the option to transfer the project to the client's Organization. If it is not there, ask Supabase support or recreate the project from a backup using `npm run import:supabase`.
- [ ] Confirm the project is still running after the transfer.

## 2. Developer sets up the new Vercel project

Do this on the client's Team, using the developer's own login.

- [ ] Add New, Project, import the `outtake-studio` repository.
- [ ] Settings, Functions: set Function Region to **Singapore (sin1)**.
- [ ] Settings, Environment Variables: add every name below. Get the values from the old Vercel project or the service dashboards. Do not send them by chat.

| Name | What it is |
|---|---|
| `ADMIN_EMAIL` | first admin login email |
| `ADMIN_PASSWORD` | first admin password (use a strong new one) |
| `SESSION_SECRET` | signs login cookies; reuse the old value so nobody is logged out |
| `SUPABASE_URL` | the project's API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | server-side database key; never expose it |
| `NOTIFY_EMAIL` | where quote and order notifications go |
| `OWNER_EMAIL` | owner address used in emails |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | outgoing email (the Gmail app password, or Resend later) |
| `PREVIEW_USER`, `PREVIEW_PASSWORD` | client preview password page; removed at launch |

- [ ] Deploy. Open the new `*.vercel.app` address and click through the site.
- [ ] Test on the new address: quote request and email arrival, a merchandise order with a payment slip, admin login, Settings, Backup download, a large image upload.
- [ ] Push a tiny harmless change from the developer's account and check that Vercel deploys it automatically. Note the result, because it decides whether the developer can keep deploying after being downgraded.

## 3. Connect the domain

- [ ] Vercel project, Settings, Domains: add the domain (and `www`).
- [ ] Cloudflare, DNS: add the records Vercel shows. If Vercel asks for it, set the records to **DNS only** (grey cloud), not proxied.
- [ ] Wait until Vercel shows the domain as valid and the lock icon works.

## 4. Email that does not land in spam

- [ ] Sign up at resend.com (client's account).
- [ ] Add the domain, add the DNS records Resend shows in Cloudflare, wait for Verified.
- [ ] Update the `SMTP_*` values in Vercel to Resend's, and set `SMTP_FROM` to an address on the new domain.
- [ ] Redeploy, then submit a test quote and check the inbox and the spam folder.

## 5. Go live

- [ ] Add `PREVIEW_AUTH_DISABLED=true` in Vercel and redeploy. The preview password page disappears.
- [ ] Change the admin password to a strong one (`npm run admin:set`).
- [ ] Remove any trial or test admin account (`npm run admin:list`, then `npm run admin:remove`).
- [ ] Decide what to do with test products and test orders (`npm run clear:orders` clears orders).
- [ ] Update `SITE_URL` in the GitHub Action `uptime.yml` to the real domain.
- [ ] Check the footer links: Privacy Policy and Terms open. Have the client read the wording and send corrections.
- [ ] Delete the old Vercel project in the developer's own account, only after everything above works.

## 6. Handover

- [ ] Give the client the admin login through a safe channel (not chat).
- [ ] Tell the client how to download a backup (Settings, Backup) and to do it after big changes and about once a month.
- [ ] Remind the client that Supabase Free pauses after a week without visits. The uptime check and daily cron keep it awake; do not delete them.
- [ ] Agree in writing what happens after go-live: who fixes problems, whether it is paid, and for how long.
- [ ] Developer is downgraded to Viewer or removed from Vercel, Cloudflare and Supabase. Remove the GitHub Collaborator too if not needed.

## What to ask the client for

- Their Vercel invitation to the developer (Member).
- Their GitHub username (to receive the repository).
- The domain name once bought.
- Confirmation that `ot.studio26@gmail.com` is the right notification and contact email.
- Corrections to the Privacy Policy and Terms wording (deposit, insurance, cancellation, late returns, portfolio rights).
