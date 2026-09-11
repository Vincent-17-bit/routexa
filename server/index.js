import express from 'express'
import cors from 'cors'

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const app = express()
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => console.log(`server on :${PORT}`))
}

export default app
