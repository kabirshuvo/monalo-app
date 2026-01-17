// Lightweight, non-blocking analytics helper
// - Uses navigator.sendBeacon when available
// - Falls back to fetch with `keepalive: true`
// - Queues events in-memory and flushes on unload
// - No-ops on server

export type AnalyticsEvent = {
  name: string
  data?: unknown
  timestamp: string
}

const QUEUE: AnalyticsEvent[] = []
let flushScheduled = false

const DEFAULT_ENDPOINT = '/api/analytics'

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined'
}

function buildPayload(events: AnalyticsEvent[]) {
  // Sanitize events to remove potential PII before sending
  const sanitized = events.map(e => ({
    name: e.name,
    timestamp: e.timestamp,
    data: sanitizeValue(e.data)
  }))
  return JSON.stringify({ events: sanitized })
}

function isEmailString(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function isPhoneString(v: string) {
  return /^\+?\d[\d ()\-]{6,}$/.test(v)
}

function sanitizeValue(value: any): any {
  if (value == null) return value
  if (typeof value === 'string') {
    if (isEmailString(value) || isPhoneString(value)) return '[REDACTED]'
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      const key = k.toLowerCase()
      if (
        key.includes('email') ||
        key.includes('phone') ||
        key.includes('name') ||
        key.includes('user') ||
        key.includes('identifier') ||
        key === 'username' ||
        key === 'firstName' ||
        key === 'lastName'
      ) {
        out[k] = '[REDACTED]'
        continue
      }
      out[k] = sanitizeValue(v)
    }
    return out
  }
  return value
}

function sendToEndpoint(body: string, endpoint: string) {
  // Best-effort, fire-and-forget delivery. Never throw and always swallow errors.
  if (!isClient()) return
  try {
    // Prefer sendBeacon for unload-safe, non-blocking delivery
    if (typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([body], { type: 'application/json' })
        // navigator.sendBeacon returns a boolean but we deliberately ignore it
        navigator.sendBeacon(endpoint, blob)
        return
      } catch {
        // fall through to fetch fallback
      }
    }

    if (typeof fetch === 'function') {
      // keepalive allows the request to be sent during unload in supporting browsers
      // Use void + catch to ensure promise rejections are swallowed
      void fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        /* swallow errors to avoid UI impact */
      })
      return
    }
  } catch {
    // ignore any unexpected errors
  }
  // If neither sendBeacon nor fetch are available, just return silently
  return
}

function flushEvents(endpoint = DEFAULT_ENDPOINT) {
  // Best-effort flush; never throw and swallow failures.
  if (!isClient()) return
  if (QUEUE.length === 0) return

  const eventsToSend = QUEUE.splice(0, QUEUE.length)
  const payload = buildPayload(eventsToSend)
  try {
    sendToEndpoint(payload, endpoint)
  } catch {
    // swallow any unexpected errors
  }
}

function scheduleFlush(endpoint = DEFAULT_ENDPOINT) {
  if (flushScheduled) return
  flushScheduled = true
  // Prefer requestIdleCallback when available, otherwise setTimeout
  const runner = () => {
    flushScheduled = false
    flushEvents(endpoint)
  }
  if (isClient() && 'requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(runner, { timeout: 2000 })
  } else {
    setTimeout(runner, 0)
  }
}

// Flush on page unload to maximize delivery chance
if (isClient()) {
  try {
    window.addEventListener('beforeunload', () => {
      if (QUEUE.length === 0) return
      const payload = buildPayload(QUEUE.splice(0, QUEUE.length))
      try {
        if (typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon(DEFAULT_ENDPOINT, new Blob([payload], { type: 'application/json' }))
        } else {
          // Last resort synchronous XHR is discouraged; rely on keepalive fetch instead
          void fetch(DEFAULT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true })
        }
      } catch {
        // ignore
      }
    })
  } catch {
    // ignore environment where window isn't fully available
  }
}

/**
 * Log an analytics event without blocking the UI.
 * Usage: `logEvent('signup', { plan: 'pro' })`
 */
export function logEvent(name: string, data?: unknown, opts?: { endpoint?: string }) {
  if (!isClient()) return
  try {
    const event: AnalyticsEvent = { name, data, timestamp: new Date().toISOString() }

    // Log locally for debugging / development
    try {
      // Keep this lightweight and non-blocking
      console.info('[analytics] event queued:', event)
    } catch {}

    // Attempt an immediate, non-blocking delivery for this single event
    try {
      const payload = buildPayload([event])
      const runner = () => {
        try {
          // fire-and-forget; sendToEndpoint handles sendBeacon/fetch keepalive
          void sendToEndpoint(payload, opts?.endpoint || DEFAULT_ENDPOINT)
        } catch {
          // swallow errors
        }
      }

      // Schedule the immediate send asynchronously so it never blocks
      if (isClient() && 'requestIdleCallback' in window) {
        ;(window as any).requestIdleCallback(runner, { timeout: 2000 })
      } else {
        // setTimeout pushes work off the main synchronous path
        setTimeout(runner, 0)
      }
    } catch {}

    // Still keep the event in the in-memory queue as a fallback/batch
    QUEUE.push(event)

    // Schedule a flush soon but non-blocking
    scheduleFlush(opts?.endpoint || DEFAULT_ENDPOINT)
  } catch {
    // swallow errors to avoid affecting UI
  }
}

// Backwards-compatibility: some callers may use `trackEvent`
export const trackEvent = (name: string, data?: unknown, opts?: { endpoint?: string }) => {
  try {
    return logEvent(name, data, opts)
  } catch {
    // swallow to keep behavior consistent
  }
}

export { flushEvents }

