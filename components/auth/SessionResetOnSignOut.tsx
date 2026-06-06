'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { markSignedOut } from '@/lib/auth/client-sign-out'

/**
 * After logout redirect: keep guest mode and clean the URL.
 * Does not call session update() — that refetches /api/auth/session and can flash logged-in UI.
 */
export default function SessionResetOnSignOut() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams?.get('signedOut') !== '1') return
    markSignedOut()
    window.history.replaceState(null, '', '/')
  }, [searchParams])

  return null
}
