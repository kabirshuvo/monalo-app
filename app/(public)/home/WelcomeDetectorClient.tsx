"use client"
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui'
import { logEvent } from '@/lib/analytics'
import { getRandomWelcome } from '@/lib/welcome'

export default function WelcomeDetectorClient() {
  const { addToast } = useToast()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Only proceed when session is ready and user is authenticated
    if (status !== 'authenticated' || !session?.user) return

    // Read the isFirstLogin flag from the server-populated session
    const isFirst = Boolean((session.user as any).isFirstLogin)
    const welcomeType = isFirst ? 'new' : 'returning'

    const finalMessage = getRandomWelcome(welcomeType)

    // Show a single non-persistent toast. Do NOT persist any client-side flags.
    try {
      addToast('info', finalMessage, 4500)
    } catch {}

    try {
      logEvent('welcome_shown', { userType: welcomeType })
    } catch {}
  }, [session, status, addToast])

  return null
}
