'use client'

import { useEffect, useState } from 'react'
import {
  precacheMediaUrls,
  registerEcoPenguinServiceWorker,
} from '@/lib/learning/offline-cache'

type Props = {
  /** Same-origin media URLs to warm into Cache Storage (current room pack). */
  precacheUrls?: string[]
}

/**
 * Registers the Eco Penguin service worker, precaches room media, and shows
 * an offline banner when the network drops.
 */
export default function OfflineShell({ precacheUrls = [] }: Props) {
  const [offline, setOffline] = useState(false)
  const [cachedHint, setCachedHint] = useState(false)

  useEffect(() => {
    void registerEcoPenguinServiceWorker()
  }, [])

  useEffect(() => {
    if (precacheUrls.length === 0) return
    void precacheMediaUrls(precacheUrls).then((n) => {
      if (n > 0) {
        setCachedHint(true)
        window.setTimeout(() => setCachedHint(false), 4000)
      }
    })
  }, [precacheUrls])

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  if (!offline && !cachedHint) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:p-4">
      {offline ? (
        <p
          className="pointer-events-auto max-w-md rounded-2xl border border-amber-400/40 bg-[#1c1917]/95 px-4 py-3 text-center text-sm font-semibold text-amber-100 shadow-lg"
          role="status"
        >
          You&apos;re offline — cached audio and pictures still work. Progress saves when you&apos;re
          back online.
        </p>
      ) : cachedHint ? (
        <p
          className="pointer-events-auto max-w-md rounded-2xl border border-emerald-400/30 bg-[#1c1917]/90 px-4 py-2 text-center text-xs font-semibold text-emerald-100/90 shadow-lg"
          role="status"
        >
          Room media saved for offline / low bandwidth
        </p>
      ) : null}
    </div>
  )
}
