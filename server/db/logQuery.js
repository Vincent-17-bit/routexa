import { db } from './client.js'

const TABLES = {
  login: { table: 'login_logs', sortable: ['timestamp', 'geo_city', 'success', 'device_id', 'deleted_at'] },
  search: { table: 'search_logs', sortable: ['timestamp', 'query_text', 'mode', 'device_id', 'deleted_at'] },
  route: { table: 'route_logs', sortable: ['timestamp', 'origin', 'destination', 'distance_km', 'device_id', 'deleted_at'] }
}

const RANGE_CLAUSE = {
  today: "date(l.timestamp, '+3 hours') = date('now', '+3 hours')",
  week: "l.timestamp >= datetime('now', '-7 days')",
  month: "l.timestamp >= datetime('now', '-1 month')",
  year: "l.timestamp >= datetime('now', '-1 year')",
  all: null
}

export function buildLogQuery(type, { range, browser, device, sort, dir, page, pageSize, includeDeleted }) {
  const def = TABLES[type]
  if (!def) throw new Error(`unknown log type: ${type}`)

  const where = []
  const args = []

  where.push(includeDeleted ? 'l.deleted_at IS NOT NULL' : 'l.deleted_at IS NULL')

  const rangeSql = RANGE_CLAUSE[range] ?? null
  if (rangeSql) where.push(rangeSql)

  if (browser?.length) {
    where.push(`d.browser IN (${browser.map(() => '?').join(',')})`)
    args.push(...browser)
  }
  if (device?.length) {
    where.push(`d.device_type IN (${device.map(() => '?').join(',')})`)
    args.push(...device)
  }

  const sortCol = def.sortable.includes(sort) ? sort : 'timestamp'
  const sortDir = dir === 'asc' ? 'ASC' : 'DESC'
  const limit = Math.min(Math.max(pageSize ?? 25, 1), 100)
  const offset = Math.max(page ?? 0, 0) * limit

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const sql = `
    SELECT l.*, d.browser AS device_browser, d.device_type AS device_type, d.device_model AS device_model
    FROM ${def.table} l
    JOIN devices d ON d.device_id = l.device_id
    ${whereSql}
    ORDER BY l.${sortCol === 'device_id' ? 'device_id' : sortCol} ${sortDir}
    LIMIT ? OFFSET ?
  `
  return { sql, args: [...args, limit, offset] }
}

export async function runLogQuery(type, params) {
  const { sql, args } = buildLogQuery(type, params)
  const res = await db.execute({ sql, args })
  return res.rows
}
