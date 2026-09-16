import { createClient } from '@libsql/client'

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

// optional read-only archive db for old rows moved out of the hot tables
export const archiveDb =
  process.env.TURSO_ARCHIVE_DATABASE_URL && process.env.TURSO_ARCHIVE_AUTH_TOKEN
    ? createClient({
        url: process.env.TURSO_ARCHIVE_DATABASE_URL,
        authToken: process.env.TURSO_ARCHIVE_AUTH_TOKEN
      })
    : null
