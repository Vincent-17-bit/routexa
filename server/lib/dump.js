import { db } from '../db/client.js'

const TABLES = ['devices', 'login_logs', 'search_logs', 'route_logs', 'device_daily_stats']

// Full logical backup via @libsql/client (works in serverless: no turso CLI,
// no filesystem shell needed). Produces one JSON blob: { table: rows[] }.
export async function dumpDatabase() {
  const out = {}
  for (const table of TABLES) {
    const res = await db.execute(`SELECT * FROM ${table}`)
    out[table] = res.rows
  }
  return out
}
