import { timingSafeEqual } from 'crypto'

function safeCompare(a, b) {
  const bufA = Buffer.from(a || '')
  const bufB = Buffer.from(b || '')
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

export function requireBearer(envVar) {
  return (req, res, next) => {
    const secret = process.env[envVar]
    if (!secret) return res.status(500).json({ error: `${envVar} not configured` })
    const provided = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : ''
    if (!safeCompare(provided, secret)) return res.status(401).json({ error: 'unauthorized' })
    next()
  }
}
