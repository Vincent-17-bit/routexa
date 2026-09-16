import { execSync } from 'child_process'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync, unlinkSync } from 'fs'

const {
  TURSO_DATABASE_NAME,
  BACKUP_S3_BUCKET,
  BACKUP_S3_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = process.env

if (!TURSO_DATABASE_NAME || !BACKUP_S3_BUCKET) {
  throw new Error('TURSO_DATABASE_NAME and BACKUP_S3_BUCKET must be set')
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dumpFile = `/tmp/${TURSO_DATABASE_NAME}-${stamp}.sql`

execSync(`turso db shell ${TURSO_DATABASE_NAME} .dump > ${dumpFile}`, { stdio: 'inherit' })

const body = readFileSync(dumpFile)
const s3 = new S3Client({
  region: BACKUP_S3_REGION || 'auto',
  credentials: AWS_ACCESS_KEY_ID ? { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } : undefined
})

await s3.send(
  new PutObjectCommand({
    Bucket: BACKUP_S3_BUCKET,
    Key: `turso-backups/${TURSO_DATABASE_NAME}-${stamp}.sql`,
    Body: body
  })
)

unlinkSync(dumpFile)
console.log(`backed up ${TURSO_DATABASE_NAME} to s3://${BACKUP_S3_BUCKET}/turso-backups/${TURSO_DATABASE_NAME}-${stamp}.sql`)
