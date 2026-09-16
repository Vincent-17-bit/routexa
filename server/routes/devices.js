import { Router } from 'express'
import { db } from '../db/client.js'

const router = Router()

router.get('/overview', async (_req, res) => {
  const [devices, active, loginsToday, searchesToday, trend] = await Promise.all([
    db.execute('SELECT COUNT(*) AS n FROM devices'),
    db.execute('SELECT COUNT(*) AS n FROM devices WHERE is_currently_online = 1'),
    db.execute(`SELECT COUNT(*) AS n FROM login_logs WHERE deleted_at IS NULL AND date(timestamp) = date('now')`),
    db.execute(`SELECT COUNT(*) AS n FROM search_logs WHERE deleted_at IS NULL AND date(timestamp) = date('now')`),
    db.execute(`
      SELECT day,
        SUM(logins_ok + logins_fail) AS logins,
        SUM(searches) AS searches
      FROM device_daily_stats
      WHERE day >= date('now', '-6 days')
      GROUP BY day
      ORDER BY day ASC
    `)
  ])

  res.json({
    totalDevices: devices.rows[0].n,
    activeNow: active.rows[0].n,
    loginsToday: loginsToday.rows[0].n,
    searchesToday: searchesToday.rows[0].n,
    trend: trend.rows
  })
})

router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.pageSize) || 25, 100)
  const offset = (Number(req.query.page) || 0) * limit
  const result = await db.execute({
    sql: 'SELECT * FROM devices ORDER BY last_seen DESC LIMIT ? OFFSET ?',
    args: [limit, offset]
  })
  res.json({ rows: result.rows })
})

router.get('/:deviceId', async (req, res) => {
  const { deviceId } = req.params
  const [device, logins, searches, routes] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM devices WHERE device_id = ?', args: [deviceId] }),
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
})

export default router
