import { NextResponse } from 'next/server'

type AnalyticsPayload = {
  event: string
  timestamp?: number | string
  properties?: Record<string, any>
}

export async function POST(request: Request) {
  try {
    const body: AnalyticsPayload = await request.json()

    if (!body || typeof body.event !== 'string' || !body.event.trim()) {
      return NextResponse.json({ ok: false, error: 'Invalid event name' }, { status: 400 })
    }

    const timestamp = body.timestamp ? new Date(body.timestamp).toISOString() : new Date().toISOString()
    const properties = body.properties && typeof body.properties === 'object' ? body.properties : {}

    // Server-side logging for now — scrub PII before logging
    const scrubbedProps: Record<string, any> = {}
    try {
      for (const [k, v] of Object.entries(properties)) {
        const key = k.toLowerCase()
        if (key.includes('email') || key.includes('phone') || key.includes('name') || key.includes('user') || key.includes('identifier') || key === 'username') {
          scrubbedProps[k] = '[REDACTED]'
        } else if (typeof v === 'string' && (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?\d[\d ()\-]{6,}$/.test(v))) {
          scrubbedProps[k] = '[REDACTED]'
        } else {
          scrubbedProps[k] = v
        }
      }
    } catch {
      // ignore
    }

    try {
      console.info('[analytics] event received:', {
        event: body.event,
        timestamp,
        properties: scrubbedProps,
      })
    } catch (e) {
      // ensure analytics doesn't throw
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'Analytics endpoint (POST events here)' })
}
