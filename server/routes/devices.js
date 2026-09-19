import { Router } from 'express'
import { asyncHandler } from '../lib/asyncHandler.js'
import { db } from '../db/client.js'
import { SESSION_GAP_MINUTES } from '../lib/sessionConfig.js'

const router = Router()
const ONLINE_CUTOFF = `-${SESSION_GAP_MINUTES} minutes`

router.get('/overview', asyncHandler(async (_req, res) => {
  const [devices, active, loginsToday, searchesToday, trend, categoryBreakdown] = await Promise.all([
    db.execute('SELECT COUNT(*) AS n FROM devices'),
    db.execute({
      sql: `SELECT COUNT(*) AS n FROM devices WHERE is_currently_online = 1 AND last_seen >= datetime('now', ?)`,
      args: [ONLINE_CUTOFF]
    }),
    db.execute(`SELECT COUNT(*) AS n FROM login_logs WHERE deleted_at IS NULL AND date(timestamp, '+3 hours') = date('now', '+3 hours')`),
    db.execute(`SELECT COUNT(*) AS n FROM search_logs WHERE deleted_at IS NULL AND date(timestamp, '+3 hours') = date('now', '+3 hours')`),
    db.execute(`
      SELECT day,
        SUM(logins_ok + logins_fail) AS logins,
        SUM(searches) AS searches
      FROM device_daily_stats
      WHERE day >= date('now', '+3 hours', '-6 days')
      GROUP BY day
      ORDER BY day ASC
    `),
    db.execute(`
      SELECT COALESCE(device_category, 'unknown') AS device_category, COUNT(*) AS n
      FROM devices
      GROUP BY device_category
      ORDER BY n DESC
    `)
  ])

  const today = new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10)
  const trendRows = trend.rows.at(-1)?.day === today
    ? trend.rows
    : [...trend.rows, { day: today, logins: loginsToday.rows[0].n, searches: searchesToday.rows[0].n }]

  res.json({
    totalDevices: devices.rows[0].n,
    activeNow: active.rows[0].n,
    loginsToday: loginsToday.rows[0].n,
    searchesToday: searchesToday.rows[0].n,
    trend: trendRows,
    categoryBreakdown: categoryBreakdown.rows
  })
}))

const DEVICE_COLUMNS = 'device_id, fingerprint_hash, first_seen, last_seen, device_type, os, browser, total_sessions, device_model, device_category'

router.get('/', asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.pageSize) || 25, 100)
  const offset = (Number(req.query.page) || 0) * limit
  const totalResult = await db.execute('SELECT COUNT(*) AS n FROM devices')
  const result = await db.execute({
    sql: `
      SELECT ${DEVICE_COLUMNS},
        (is_currently_online = 1 AND last_seen >= datetime('now', ?)) AS is_currently_online
      FROM devices
      ORDER BY last_seen DESC
      LIMIT ? OFFSET ?
    `,
    args: [ONLINE_CUTOFF, limit, offset]
  })
  res.json({ rows: result.rows, total: totalResult.rows[0].n, page: Number(req.query.page) || 0, pageSize: limit })
}))

router.get('/:deviceId', asyncHandler(async (req, res) => {
  const { deviceId } = req.params
  const [device, logins, searches, routes] = await Promise.all([
    db.execute({
      sql: `
        SELECT ${DEVICE_COLUMNS},
          (is_currently_online = 1 AND last_seen >= datetime('now', ?)) AS is_currently_online
        FROM devices WHERE device_id = ?
      `,
      args: [ONLINE_CUTOFF, deviceId]
    }),
    db.execute({
      sql: 'SELECT * FROM login_logs WHERE device_id = ? AND deleted_at IS NULL ORDER BY timestamp DESC LIMIT 50',
      args: [deviceId]
    }),
    db.execute({
      sql: 'SELECT * FROM search_logs WHERE device_id = ? AND deleted_at IS NULL ORDER BY timestamp DESC LIMIT 50',
      args: [deviceId]
    }),
    db.execute({
      sql: 'SELECT * FROM route_logs WHERE device_id = ? AND deleted_at IS NULL ORDER BY timestamp DESC LIMIT 50',
      args: [deviceId]
    })
  ])

  if (!device.rows.length) return res.status(404).json({ error: 'device not found' })
  res.json({ device: device.rows[0], logins: logins.rows, searches: searches.rows, routes: routes.rows })
}))

export default router