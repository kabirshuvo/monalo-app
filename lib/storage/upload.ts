import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { createR2S3Client, r2BucketName, r2PublicBaseUrl } from '@/lib/storage/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'

export { isR2Configured } from '@/lib/storage/r2'

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
  const base = r2PublicBaseUrl()
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
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = await getCloudflareContext({ async: true })
    const bucket = (env as { MEDIA_BUCKET?: {
      put: (k: string, v: Buffer, o?: { httpMetadata?: { contentType?: string } }) => Promise<void>
    } }).MEDIA_BUCKET
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
  const client = createR2S3Client()
  const bucket = r2BucketName()
  if (!client || !bucket) return null

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
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

