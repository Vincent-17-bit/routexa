# Turso backup & point-in-time recovery

Retention window is set by plan tier and confirmed current per <cite index="12-1">docs.turso.tech</cite>:
Free = 24h, Developer = 10 days, Scaler = 30 days, Pro = 90 days.

## How to restore

There is no dashboard "restore" button — PITR works by spinning up a **new**
database seeded from the old one at a timestamp, then cutting the app over:

```bash
turso db create routexa-restored --from-db routexa --timestamp 2026-09-10T00:00:00Z
turso db tokens create routexa-restored
```

Then update `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` in the server's env to
point at `routexa-restored`, redeploy, verify, and only then delete the old
database. The restore counts against the plan's database quota, and you
can't restore into a database that already exists — it's always a new one.

## Independent copy (this repo)

Two ways this is wired up, depending on how the server is hosted:

**On Vercel (this deployment):** there is no persistent OS and no `turso` CLI
available inside a serverless function, so `scripts/backup-to-s3.js`
(which shells out to `turso db shell`) cannot run there. Instead,
`routes/cron.js` exposes `GET /api/cron/backup`, which dumps every table via
`@libsql/client` (pure SQL, no CLI) and uploads a JSON snapshot to S3. It's
wired into `vercel.json`'s `crons` array alongside `/api/cron/rollup`, and
protected by a `CRON_SECRET` env var that Vercel sends automatically as
`Authorization: Bearer <CRON_SECRET>` when it invokes a cron path. Set
`CRON_SECRET` in the server project's env vars for this to work. Note:
Vercel Hobby plan cron jobs run at most once/day and only at their
scheduled time — there is no "run now" from the dashboard, but you can hit
either endpoint manually with the same Authorization header to backfill.

**On a traditional host (VM, dedicated server with `turso` CLI + real
crontab):** `scripts/backup-to-s3.js` and `scripts/rollup.js` still work as
originally designed, scheduled via `scripts/crontab.example`, and produce a
raw `.dump` SQL file instead of a JSON snapshot.

Either way, this exists so a problem with the Turso account itself (not
just the data) doesn't take down the only copy — PITR and the S3 dump are
independent failure domains.
