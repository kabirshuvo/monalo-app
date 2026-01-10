import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, notifications: [] })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({ ok: true, sent: body })
}
