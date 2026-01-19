"use client"
import React, { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useWelcomeToast } from '@/components/ui'
import { logEvent } from '@/lib/analytics'
import { getRandomWelcome } from '@/lib/welcome'

export default function WelcomeDetectorClient() {
  const { showWelcome } = useWelcomeToast()
  const { data: session, status } = useSession()
  const shownRef = useRef(false)

  useEffect(() => {
    // Only proceed when session is ready and user is authenticated
    if (status !== 'authenticated' || !session?.user) return

    // Ensure we only show the toast once per page load (no persistence across reloads)
    if (shownRef.current) return

    // Read the isFirstLogin flag from the server-populated session
    const isFirst = Boolean((session.user as any).isFirstLogin)
    const welcomeType = isFirst ? 'new' : 'returning'

    const finalMessage = getRandomWelcome(welcomeType)

    // Show a single non-persistent toast. Do NOT persist any client-side flags.
    try {
      showWelcome(finalMessage, 4500)
      shownRef.current = true
    } catch {}

    try {
      const eventName = isFirst ? 'first_login' : 'login'
      const role = (session.user as any)?.role
      const method = (session.user as any)?.provider || (session.user as any)?.authMethod || (session.user as any)?.method
      const payload: Record<string, any> = { userType: welcomeType }
      if (role) payload.role = role
      if (method) payload.method = method
      logEvent(eventName, payload)
    } catch {}
  }, [session, status, showWelcome])

  return null
}
