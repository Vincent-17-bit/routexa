import { Router } from 'express'
import { db } from '../db/client.js'
import { buildLogQuery, runLogQuery } from '../db/logQuery.js'

const router = Router()
const TYPES = new Set(['login', 'search', 'route'])
const TABLE = { login: 'login_logs', search: 'search_logs', route: 'route_logs' }

function parseParams(req) {
  const q = req.query
  return {
    range: q.range || 'all',
    browser: q.browser ? q.browser.split(',').filter(Boolean) : [],
    device: q.device ? q.device.split(',').filter(Boolean) : [],
    sort: q.sort || 'timestamp',
    dir: q.dir || 'desc',
    page: Number(q.page) || 0,
    pageSize: Number(q.pageSize) || 25
  }
}

router.get('/:type', async (req, res) => {
  const { type } = req.params
  if (!TYPES.has(type)) return res.status(404).json({ error: 'unknown log type' })
  const params = parseParams(req)
  const rows = await runLogQuery(type, { ...params, includeDeleted: false })
  res.json({ rows, page: params.page, pageSize: params.pageSize })
})

router.get('/:type/deleted', async (req, res) => {
  const { type } = req.params
  if (!TYPES.has(type)) return res.status(404).json({ error: 'unknown log type' })
  const params = parseParams(req)
  const rows = await runLogQuery(type, { ...params, sort: 'deleted_at', includeDeleted: true })
  res.json({ rows })
})

router.get('/:type/export', async (req, res) => {
  const { type } = req.params
  if (!TYPES.has(type)) return res.status(404).json({ error: 'unknown log type' })
  const format = req.query.format === 'json' ? 'json' : 'csv'
  const params = parseParams(req)
  const { sql, args } = buildLogQuery(type, { ...params, page: 0, pageSize: 10000, includeDeleted: false })
  const result = await db.execute({ sql, args })

  if (format === 'json') {
    res.setHeader('Content-Disposition', `attachment; filename="${type}_logs.json"`)
    return res.json(result.rows)
  }

  const cols = result.columns
  const csv = [cols.join(',')]
    .concat(result.rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? '')).join(',')))
    .join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="${type}_logs.csv"`)
  res.send(csv)
})

router.patch('/:type/:id/delete', async (req, res) => {
  const { type, id } = req.params
  if (!TYPES.has(type)) return res.status(404).json({ error: 'unknown log type' })
  await db.execute({
    sql: `UPDATE ${TABLE[type]} SET deleted_at = datetime('now') WHERE id = ?`,
    args: [id]
  })
  res.json({ ok: true })
})

router.patch('/:type/:id/restore', async (req, res) => {
  const { type, id } = req.params
  if (!TYPES.has(type)) return res.status(404).json({ error: 'unknown log type' })
  await db.execute({
    sql: `UPDATE ${TABLE[type]} SET deleted_at = NULL WHERE id = ?`,
    args: [id]
  })
  res.json({ ok: true })
})

export default router
