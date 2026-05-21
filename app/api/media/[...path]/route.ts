import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

type Params = { params: Promise<{ path: string[] }> }

/**
 * Serve uploaded media when R2 bucket is private (local dev or proxy mode).
 * Public R2 custom domains can skip this and use R2_PUBLIC_BASE_URL directly.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { path: segments } = await params
  const key = segments.join('/')

  if (!key || key.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  // Try R2 fetch via S3 API
  const fromR2 = await fetchFromR2(key)
  if (fromR2) return fromR2

  // Local fallback
  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', key)
    const data = await readFile(filePath)
    const ext = key.split('.').pop()?.toLowerCase()
    const type =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : ext === 'gif'
            ? 'image/gif'
            : 'image/jpeg'

    return new NextResponse(data, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

async function fetchFromR2(key: string): Promise<NextResponse | null> {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET_NAME

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null
  }

  try {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })

    const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    if (!out.Body) return null

    const bytes = await out.Body.transformToByteArray()
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': out.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return null
  }
}
