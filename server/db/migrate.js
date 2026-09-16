import { readdirSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { db } from './client.js'

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations')
const DESTRUCTIVE = /\b(DROP\s+TABLE|DROP\s+COLUMN|ALTER\s+TABLE\s+\w+\s+DROP)\b/i

async function ensureMigrationsTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

async function appliedNames() {
  const res = await db.execute('SELECT name FROM _migrations')
  return new Set(res.rows.map((r) => r.name))
}

export async function migrate({ confirmDestructive = false } = {}) {
  await ensureMigrationsTable()
  const done = await appliedNames()
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    if (done.has(file)) continue
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8')

    if (DESTRUCTIVE.test(sql) && !confirmDestructive) {
      throw new Error(
        `Migration ${file} contains a destructive statement (DROP). Re-run with confirmDestructive: true to apply it.`
      )
    }

    await db.executeMultiple(sql)
    await db.execute({ sql: 'INSERT INTO _migrations (name) VALUES (?)', args: [file] })
    console.log(`applied ${file}`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const confirmDestructive = process.argv.includes('--confirm-destructive')
  migrate({ confirmDestructive })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message)
      process.exit(1)
    })
}
