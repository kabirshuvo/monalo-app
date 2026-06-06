import { NextRequest, NextResponse } from 'next/server'
import { requireRole, AuthorizationError } from '@/lib/auth/role'
import { uploadImage, isR2Configured, type UploadFolder } from '@/lib/storage/upload'

const ALLOWED_FOLDERS: UploadFolder[] = ['gallery', 'shop', 'products', 'blog']

/**
 * POST /api/uploads — multipart image upload (SELLER, ADMIN, WRITER)
 * Form fields: file (required), folder (gallery | shop | products | blog)
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN', 'SELLER', 'WRITER'])

    const form = await request.formData()
    const file = form.get('file')
    const folder = (form.get('folder') as string) || 'gallery'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_FOLDERS.includes(folder as UploadFolder)) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
    }

    const { url, key } = await uploadImage(file, folder as UploadFolder)

    return NextResponse.json({
      ok: true,
      url,
      key,
      storage: isR2Configured() ? 'r2' : 'local',
    })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[POST /api/uploads]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
