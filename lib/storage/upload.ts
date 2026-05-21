import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export type UploadFolder = 'gallery' | 'shop' | 'products'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Only JPEG, PNG, WebP, or GIF images are allowed.'
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

function extensionForType(type: string): string {
  switch (type) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'bin'
  }
}

function buildKey(folder: UploadFolder, contentType: string): string {
  const ext = extensionForType(contentType)
  return `${folder}/${randomUUID()}.${ext}`
}

function publicUrlForKey(key: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')
  if (base) return `${base}/${key}`
  const app = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || ''
  return `${app}/api/media/${key}`
}

async function tryCloudflareBinding(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string | null> {
  try {
    const mod = await import('@opennextjs/cloudflare')
    const getContext = (mod as { getCloudflareContext?: () => Promise<{ env: Record<string, unknown> }> })
      .getCloudflareContext
    if (!getContext) return null

    const { env } = await getContext()
    const bucket = env.MEDIA_BUCKET as
      | { put: (k: string, v: Buffer, o?: { httpMetadata?: { contentType?: string } }) => Promise<void> }
      | undefined
    if (!bucket?.put) return null

    await bucket.put(key, body, { httpMetadata: { contentType } })
    return publicUrlForKey(key)
  } catch {
    return null
  }
}

async function uploadViaS3Api(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string | null> {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET_NAME

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null
  }

  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    )
    return publicUrlForKey(key)
  } catch (err) {
    console.error('[upload] S3/R2 error:', err)
    return null
  }
}

async function uploadLocal(
  key: string,
  body: Buffer
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  const filePath = path.join(uploadsDir, key)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, body)
  return `/uploads/${key}`
}

/**
 * Store image in R2 (binding or S3 API) or local public/uploads for dev.
 */
export async function uploadImage(
  file: File,
  folder: UploadFolder
): Promise<{ url: string; key: string }> {
  const err = validateImageFile(file)
  if (err) throw new Error(err)

  const buffer = Buffer.from(await file.arrayBuffer())
  const key = buildKey(folder, file.type)

  const fromBinding = await tryCloudflareBinding(key, buffer, file.type)
  if (fromBinding) return { url: fromBinding, key }

  const fromS3 = await uploadViaS3Api(key, buffer, file.type)
  if (fromS3) return { url: fromS3, key }

  const localUrl = await uploadLocal(key, buffer)
  return { url: localUrl, key }
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  )
}
