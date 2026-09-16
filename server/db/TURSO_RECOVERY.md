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

`scripts/backup-to-s3.js` runs `turso db shell <db> .dump` and uploads the
raw SQL dump to S3 on the schedule in `scripts/crontab.example`. This exists
so a problem with the Turso account itself (not just the data) doesn't take
down the only copy — PITR and the S3 dump are independent failure domains.
