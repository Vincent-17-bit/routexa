import express from 'express'
import cors from 'cors'
import logsRouter from './routes/logs.js'
import devicesRouter from './routes/devices.js'
import trackRouter from './routes/track.js'
import { migrate } from './db/migrate.js'

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const app = express()
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/logs', logsRouter)
app.use('/api/devices', devicesRouter)
app.use('/api', trackRouter)

migrate().catch((err) => console.error('startup migration failed:', err.message))

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => console.log(`server on :${PORT}`))
}

export default app
