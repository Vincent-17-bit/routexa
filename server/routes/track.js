import { Router } from 'express'
import { asyncHandler } from '../lib/asyncHandler.js'
import { db } from '../db/client.js'
import { lookupGeo } from '../lib/geoip.js'
import { parseDevice } from '../lib/deviceModel.js'
import { SESSION_GAP_MINUTES } from '../lib/sessionConfig.js'

const router = Router()

async function upsertDevice({ device_id, fingerprint_hash, device_type, os, browser, device_model, device_category }) {
  await db.execute({
    sql: `
      INSERT INTO devices (device_id, fingerprint_hash, device_type, os, browser, device_model, device_category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (device_id) DO UPDATE SET
        last_seen = datetime('now'),
        device_type = excluded.device_type,
        os = excluded.os,
        browser = excluded.browser,
        device_model = COALESCE(excluded.device_model, devices.device_model),
        device_category = COALESCE(excluded.device_category, devices.device_category)
    `,
    args: [device_id, fingerprint_hash, device_type ?? null, os ?? null, browser ?? null, device_model ?? null, device_category ?? null]
  })
}

router.post('/devices/track', asyncHandler(async (req, res) => {
  const { device_id, fingerprint_hash, device_type, os, browser } = req.body || {}
  if (!device_id) return res.status(400).json({ error: 'device_id required' })
  const { device_type: device_category, device_model } = parseDevice(req.headers['user-agent'])
  await upsertDevice({ device_id, fingerprint_hash: fingerprint_hash || device_id, device_type, os, browser, device_model, device_category })
  res.json({ ok: true })
}))

router.post('/devices/:deviceId/offline', asyncHandler(async (req, res) => {
  await db.execute({
    sql: `UPDATE devices SET is_currently_online = 0 WHERE device_id = ?`,
    args: [req.params.deviceId]
  })
  res.json({ ok: true })
}))

async function secondsSinceLastLogin(device_id) {
  const result = await db.execute({
    sql: `
      SELECT (strftime('%s', 'now') - strftime('%s', timestamp)) AS diff_seconds
      FROM login_logs
      WHERE device_id = ? AND deleted_at IS NULL
      ORDER BY timestamp DESC
      LIMIT 1
    `,
    args: [device_id]
  })
  return result.rows[0]?.diff_seconds ?? null
}

router.post('/logs/login', asyncHandler(async (req, res) => {
  const { device_id, success = true, fingerprint_hash, device_type, os, browser } = req.body || {}
  if (!device_id) return res.status(400).json({ error: 'device_id required' })

  const userAgent = req.headers['user-agent'] || null
  const { device_type: device_category, device_model } = parseDevice(userAgent)
  await upsertDevice({ device_id, fingerprint_hash: fingerprint_hash || device_id, device_type, os, browser, device_model, device_category })

  const diffSeconds = await secondsSinceLastLogin(device_id)
  const isNewSession = diffSeconds === null || diffSeconds > SESSION_GAP_MINUTES * 60

  if (isNewSession) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip
    const { city: geo_city, country: geo_country } = await lookupGeo(ip)

    await db.execute({
      sql: `INSERT INTO login_logs (device_id, ip, geo_city, geo_country, user_agent, success) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [device_id, ip, geo_city, geo_country, userAgent, success ? 1 : 0]
    })

    await db.execute({
      sql: `UPDATE devices SET total_sessions = total_sessions + 1, is_currently_online = 1, last_seen = datetime('now') WHERE device_id = ?`,
      args: [device_id]
    })
  } else {
    await db.execute({
      sql: `UPDATE devices SET is_currently_online = 1, last_seen = datetime('now') WHERE device_id = ?`,
      args: [device_id]
    })
  }

  res.json({ ok: true, newSession: isNewSession })
}))

router.post('/logs/search', asyncHandler(async (req, res) => {
  const { device_id, session_id, query_text, query_type, mode, result_count } = req.body || {}
  if (!device_id || !query_text) return res.status(400).json({ error: 'device_id and query_text required' })

  await db.execute({
    sql: `INSERT INTO search_logs (device_id, session_id, query_text, query_type, mode, result_count) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [device_id, session_id || null, query_text, query_type || null, mode || null, result_count ?? null]
  })
  res.json({ ok: true })
}))

router.post('/logs/route', asyncHandler(async (req, res) => {
  const { device_id, origin, destination, mode, distance_km, eta_min, tolls_detected } = req.body || {}
  if (!device_id || !origin || !destination) return res.status(400).json({ error: 'device_id, origin, destination required' })

  await db.execute({
    sql: `INSERT INTO route_logs (device_id, origin, destination, mode, distance_km, eta_min, tolls_detected) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [device_id, origin, destination, mode || null, distance_km ?? null, eta_min ?? null, tolls_detected ? 1 : 0]
  })
  res.json({ ok: true })
}))

export default router