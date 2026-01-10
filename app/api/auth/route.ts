import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ ok: true, body })
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Auth API root' })
}
