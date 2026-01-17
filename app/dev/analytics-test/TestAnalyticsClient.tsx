"use client"
import React, { useEffect, useState } from 'react'
import { logEvent, flushEvents } from '@/lib/analytics'

export default function TestAnalyticsClient() {
  const [status, setStatus] = useState<'idle' | 'queued' | 'sent' | 'error'>('idle')

  const sendTest = () => {
    setStatus('queued')
    try {
      // Fire a test event (fire-and-forget)
      logEvent('test_event', { test: true, timestamp: new Date().toISOString() })
      // Try a best-effort flush but don't await
      try { flushEvents() } catch {}
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    sendTest()
  }, [])

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Analytics test</h2>
      <p className="mb-3 text-sm text-gray-600">A test analytics event is sent when this page loads.</p>
      <p className="mb-3"><strong>Status:</strong> {status}</p>
      <div className="flex gap-2">
        <button
          onClick={sendTest}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Send test event
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">Check server logs or the `/api/analytics` handler to confirm receipt.</p>
    </div>
  )
}
