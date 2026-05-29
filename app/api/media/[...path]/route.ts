import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import {
  contentTypeForKey,
  createR2S3Client,
  r2BucketName,
} from '@/lib/storage/r2'

type Params = { params: Promise<{ path: string[] }> }

/**
 * Serve media when R2 bucket is private (local dev or proxy mode).
 * Public R2 custom domains should use R2_PUBLIC_BASE_URL directly.
 *
 * Keys include gallery uploads and Eco Penguin: eco-penguine/images/...
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { path: segments } = await params
  const key = segments.join('/')

  if (!key || key.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const fromR2 = await fetchFromR2(key)
  if (fromR2) return fromR2

  const local = await readLocalMedia(key)
  if (local) return local

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

async function fetchFromR2(key: string): Promise<NextResponse | null> {
  const client = createR2S3Client()
  const bucket = r2BucketName()
  if (!client || !bucket) return null

  try {
    const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    if (!out.Body) return null

    const bytes = await out.Body.transformToByteArray()
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': out.ContentType || contentTypeForKey(key),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return null
  }
}

async function readLocalMedia(key: string): Promise<NextResponse | null> {
  const candidates = [
    path.join(process.cwd(), 'public', 'uploads', key),
    path.join(process.cwd(), 'public', key),
  ]

  for (const filePath of candidates) {
    try {
      const data = await readFile(filePath)
      return new NextResponse(data, {
        headers: {
          'Content-Type': contentTypeForKey(key),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {
      // try next path
    }
  }

  return null
}
