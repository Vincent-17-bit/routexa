import { db } from '../db/client.js'

export async function rollupDay(day) {
  const targetDay = day || new Date().toISOString().slice(0, 10)

  const logins = await db.execute({
    sql: `
      SELECT device_id,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) AS ok,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS fail
      FROM login_logs
      WHERE deleted_at IS NULL AND date(timestamp) = date(?)
      GROUP BY device_id
    `,
    args: [targetDay]
  })
  const searches = await db.execute({
    sql: `SELECT device_id, COUNT(*) AS n FROM search_logs WHERE deleted_at IS NULL AND date(timestamp) = date(?) GROUP BY device_id`,
    args: [targetDay]
  })
  const routes = await db.execute({
    sql: `SELECT device_id, COUNT(*) AS n FROM route_logs WHERE deleted_at IS NULL AND date(timestamp) = date(?) GROUP BY device_id`,
    args: [targetDay]
  })

  const byDevice = new Map()
  for (const r of logins.rows) byDevice.set(r.device_id, { logins_ok: r.ok, logins_fail: r.fail, searches: 0, routes: 0 })
  for (const r of searches.rows) {
    const cur = byDevice.get(r.device_id) || { logins_ok: 0, logins_fail: 0, searches: 0, routes: 0 }
    cur.searches = r.n
    byDevice.set(r.device_id, cur)
  }
  for (const r of routes.rows) {
    const cur = byDevice.get(r.device_id) || { logins_ok: 0, logins_fail: 0, searches: 0, routes: 0 }
    cur.routes = r.n
    byDevice.set(r.device_id, cur)
  }

  for (const [deviceId, stats] of byDevice) {
    await db.execute({
      sql: `
        INSERT INTO device_daily_stats (device_id, day, logins_ok, logins_fail, searches, routes)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (device_id, day) DO UPDATE SET
          logins_ok = excluded.logins_ok,
          logins_fail = excluded.logins_fail,
          searches = excluded.searches,
          routes = excluded.routes
      `,
      args: [deviceId, targetDay, stats.logins_ok, stats.logins_fail, stats.searches, stats.routes]
    })
  }

  return { day: targetDay, devices: byDevice.size }
}

if (process.argv[1] && process.argv[1].endsWith('rollup.js')) {
  rollupDay(process.argv[2])
    .then((r) => console.log(`rolled up ${r.devices} devices for ${r.day}`))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
