"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import welcomeMessages from '../../../welcomeMessages.json'
import { useToast } from '@/components/ui'

export default function WelcomeDetectorClient() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [hasWelcome, setHasWelcome] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    const v = searchParams?.get('welcome')
    if (v !== null && v !== undefined) {
      // Only show once per session/login: check sessionStorage
      const STORAGE_KEY = 'monalo_welcome_shown'
      try {
        const already = sessionStorage.getItem(STORAGE_KEY)
        if (already) {
          // If we've already shown the toast this session, just remove the param and exit
          try {
            const params = new URLSearchParams(searchParams?.toString() || '')
            params.delete('welcome')
            const newQuery = params.toString()
            const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname
            router.replace(newUrl)
          } catch {
            // ignore
          }
          return
        }
      } catch {
        // sessionStorage may be unavailable in some environments — fall back to showing once per-page-load
      }
      // Select a random welcome message based on welcome type (new/back)
      const welcomeType = v // expected values: 'new' | 'back'
      let selected: string | null = null
      try {
        const welcomeData = welcomeMessages as any
        const messages = welcomeType === 'new' ? welcomeData.newUser || [] : welcomeData.returningUser || []
        selected = messages.length ? messages[Math.floor(Math.random() * messages.length)] : null
      } catch {
        selected = null
      }

      setHasWelcome(true)
      const finalMessage = selected || 'Welcome!'
      setMessage(finalMessage)

      // Show a non-blocking toast notification
      try {
        addToast('info', finalMessage, 4000)
      } catch {
        // swallow if toast isn't available
      }

      // Mark as shown for this session so refresh won't show it again
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        // ignore
      }

      // Remove the `welcome` query param from the URL without reloading
      try {
        const params = new URLSearchParams(searchParams?.toString() || '')
        params.delete('welcome')
        const newQuery = params.toString()
        const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname
        router.replace(newUrl)
      } catch {
        // ignore failures to update URL
      }
    } else {
      setHasWelcome(false)
      setMessage(null)
    }
  }, [searchParams, addToast, pathname, router])

  if (!hasWelcome) return null

  return (
    <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded p-3 text-center">
      {message}
    </div>
  )
}
