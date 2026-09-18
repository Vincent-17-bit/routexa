import { createClient } from '@libsql/client'

let _db = null

function getDb() {
  if (!_db) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
    }
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    })
  }
  return _db
}

// lazy: a missing/bad Turso credential only breaks DB-touching routes,
// never the whole serverless function (so /api/health stays up).
// methods are bound to the real client — libsql's native binding needs
// the correct `this`, which a bare Proxy would break.
export const db = new Proxy(
  {},
  {
    get: (_t, prop) => {
      const real = getDb()
      const val = real[prop]
      return typeof val === 'function' ? val.bind(real) : val
    }
  }
)
