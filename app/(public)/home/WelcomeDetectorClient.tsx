"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui'
import { logEvent } from '@/lib/analytics'
import { getRandomWelcome } from '@/lib/welcome'

export default function WelcomeDetectorClient() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [hasWelcome, setHasWelcome] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { addToast } = useToast()
  const { status } = useSession()

  useEffect(() => {
    const v = searchParams?.get('welcome')
    if (v !== null && v !== undefined) {
      // Only show when authenticated and when login session exists
      if (status !== 'authenticated') return

      const LOGIN_KEY = 'monalo_login_start'
      const SHOWN_KEY = 'monalo_welcome_shown'

      try {
        const loginStart = sessionStorage.getItem(LOGIN_KEY)
        if (!loginStart) {
          // Not a new login session — skip showing welcome
          // Remove query param and exit
          try {
            const params = new URLSearchParams(searchParams?.toString() || '')
            params.delete('welcome')
            const newQuery = params.toString()
            const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname
            router.replace(newUrl)
          } catch {}
          return
        }

        const already = sessionStorage.getItem(SHOWN_KEY)
        if (already) {
          try {
            const params = new URLSearchParams(searchParams?.toString() || '')
            params.delete('welcome')
            const newQuery = params.toString()
            const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname
            router.replace(newUrl)
          } catch {}
          return
        }
      } catch {
        // sessionStorage may be unavailable — fall back to existing behavior
      }

      const welcomeType = v === 'new' ? 'new' : 'returning'
      const finalMessage = getRandomWelcome(welcomeType === 'new' ? 'new' : 'returning')

      setHasWelcome(true)
      setMessage(finalMessage)

      try {
        addToast('info', finalMessage, 4500)
        try {
          logEvent('welcome_shown', { userType: welcomeType })
        } catch {}
      } catch {}

      try {
        sessionStorage.setItem('monalo_welcome_shown', '1')
      } catch {}

      // Remove the welcome param from URL
      try {
        const params = new URLSearchParams(searchParams?.toString() || '')
        params.delete('welcome')
        const newQuery = params.toString()
        const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname
        router.replace(newUrl)
      } catch {}
    } else {
      setHasWelcome(false)
      setMessage(null)
    }
  }, [searchParams, addToast, pathname, router, status])

  // Non-blocking: welcome is shown via toast only. Do not render inline content.
  return null
}
