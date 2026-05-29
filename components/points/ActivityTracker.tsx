'use client'

import { useEffect, useRef } from 'react'
import api from '@/lib/api'

type ActivityTrackerProps = {
  type: 'blog' | 'learning'
  /** Poll interval to sync cumulative minutes (ms) */
  intervalMs?: number
}

/**
 * Tracks time on page and syncs cumulative minutes to the points API.
 */
export default function ActivityTracker({
  type,
  intervalMs = 60_000,
}: ActivityTrackerProps) {
  const minutesRef = useRef(0)
  const startedRef = useRef(Date.now())

  useEffect(() => {
    startedRef.current = Date.now()

    const sync = async () => {
      const elapsedMs = Date.now() - startedRef.current
      const sessionMinutes = Math.floor(elapsedMs / 60_000)
      const totalMinutes = minutesRef.current + sessionMinutes
      if (totalMinutes < 1) return

      try {
        await api.post('/api/points/activity', {
          type,
          minutes: totalMinutes,
        })
        minutesRef.current = totalMinutes
        startedRef.current = Date.now()
      } catch {
        // Non-blocking — will retry on next interval
      }
    }

    const id = window.setInterval(sync, intervalMs)
    const onLeave = () => {
      void sync()
    }
    window.addEventListener('beforeunload', onLeave)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void sync()
    })

    return () => {
      window.clearInterval(id)
      window.removeEventListener('beforeunload', onLeave)
      void sync()
    }
  }, [type, intervalMs])

  return null
}
