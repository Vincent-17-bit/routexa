import { Router } from 'express'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { asyncHandler } from '../lib/asyncHandler.js'
import { rollupDay } from '../scripts/rollup.js'
import { dumpDatabase } from '../lib/dump.js'
import { requireBearer } from '../lib/auth.js'

const router = Router()
const requireCronAuth = requireBearer('CRON_SECRET')

router.get('/rollup', requireCronAuth, asyncHandler(async (req, res) => {
  const result = await rollupDay(req.query.day)
  res.json({ ok: true, result })
}))

router.get('/backup', requireCronAuth, asyncHandler(async (_req, res) => {
  const { BACKUP_S3_BUCKET, BACKUP_S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, TURSO_DATABASE_NAME } = process.env
  if (!BACKUP_S3_BUCKET) return res.status(500).json({ error: 'BACKUP_S3_BUCKET not configured' })

  const data = await dumpDatabase()
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const key = `turso-backups/${TURSO_DATABASE_NAME || 'routexa'}-${stamp}.json`

  const s3 = new S3Client({
    region: BACKUP_S3_REGION || 'auto',
    credentials: AWS_ACCESS_KEY_ID ? { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } : undefined
  })
  await s3.send(new PutObjectCommand({ Bucket: BACKUP_S3_BUCKET, Key: key, Body: JSON.stringify(data) }))

  res.json({ ok: true, key })
}))

export default router
