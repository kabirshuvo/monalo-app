"use client"
import React from 'react'

export type LoadingStateVariant =
  | 'global'
  | 'page'
  | 'auth'
  | 'profile'
  | 'dashboard'
  | 'shop'
  | 'gallery'
  | 'blog'
  | 'admin'
  | 'lesson'
  | 'course'
  | 'progress'
  | 'notes'
  | 'cart'
  | 'checkout'
  | 'order'
  | 'artwork'

export interface LoadingStateProps {
  variant?: LoadingStateVariant
  message?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  className?: string
}

const variantMessages: Record<LoadingStateVariant, { title: string; hint?: string }> = {
  global: { title: 'Just a moment...', hint: 'MonAlo is getting things ready.' },
  page: { title: 'Loading page...', hint: 'Almost there.' },
  auth: { title: 'Checking your session...', hint: 'Hang tight while we sign you in.' },
  profile: { title: 'Loading your profile...', hint: 'Gathering your points and progress.' },
  dashboard: { title: 'Opening your dashboard...', hint: 'Your space is on the way.' },
  shop: { title: 'Opening the craft shop...', hint: 'Handmade pieces from Monalo School.' },
  gallery: { title: 'Loading the gallery...', hint: 'Art and craft from our community.' },
  blog: { title: 'Loading stories...', hint: 'Thoughtful reads from MonAlo.' },
  admin: { title: 'Loading admin tools...', hint: 'Platform management loading.' },
  lesson: { title: 'Opening your lesson...', hint: 'Take a breath — learning is not a race.' },
  course: { title: 'Preparing this course...', hint: 'Your next step is almost ready.' },
  progress: { title: 'Loading your progress...', hint: 'Every small step counts.' },
  notes: { title: 'Gathering your notes...', hint: 'Your ideas matter here.' },
  cart: { title: 'Updating your cart...', hint: 'Craft shop items loading.' },
  checkout: { title: 'Preparing checkout...', hint: 'Almost ready to place your order.' },
  order: { title: 'Processing your order...', hint: 'Thank you for supporting MonAlo.' },
  artwork: { title: 'Loading artwork...', hint: 'Preview preparing.' },
}

const markSizes = {
  sm: { box: 'h-8 w-8', text: 'text-[10px]', ring: 'border-[2px]' },
  md: { box: 'h-12 w-12', text: 'text-xs', ring: 'border-2' },
  lg: { box: 'h-16 w-16', text: 'text-sm', ring: 'border-[3px]' },
} as const

export function SmartLoaderMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = markSizes[size]
  return (
    <div className={`relative ${s.box}`} aria-hidden>
      <span className={`absolute inset-0 rounded-full bg-purple-400/15 animate-ping`} />
      <span
        className={`absolute inset-0 rounded-full ${s.ring} border-purple-200 border-t-purple-600 dark:border-purple-900 dark:border-t-purple-400 animate-spin`}
      />
      <span
        className={`absolute inset-0 flex items-center justify-center font-semibold text-purple-700 dark:text-purple-300 ${s.text}`}
      >
        M
      </span>
    </div>
  )
}

export default function LoadingState({
  variant = 'global',
  message,
  hint,
  size = 'md',
  fullScreen = false,
  className = '',
}: LoadingStateProps) {
  const copy = variantMessages[variant]
  const displayMessage = message ?? copy.title
  const displayHint = hint ?? copy.hint

  const content = (
    <div
      className="flex flex-col items-center justify-center gap-3 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <SmartLoaderMark size={size} />
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-800 dark:text-zinc-100">{displayMessage}</p>
        {displayHint && (
          <p className="max-w-xs text-xs text-gray-500 dark:text-zinc-400">{displayHint}</p>
        )}
      </div>
      <span className="sr-only">Loading content</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-50/95 backdrop-blur-sm dark:bg-zinc-950/95 ${className}`}
      >
        {content}
      </div>
    )
  }

  return <div className={`py-16 px-4 ${className}`}>{content}</div>
}

/** Next.js `loading.tsx` — centered route placeholder */
export function RouteLoader({
  variant = 'page',
  className = 'min-h-[60vh]',
}: {
  variant?: LoadingStateVariant
  className?: string
}) {
  return (
    <div className={`flex items-center justify-center px-4 ${className}`}>
      <LoadingState variant={variant} size="lg" />
    </div>
  )
}

/** Suspense boundaries and auth session checks */
export function SuspenseLoader({ variant = 'auth' }: { variant?: LoadingStateVariant }) {
  return <LoadingState variant={variant} fullScreen />
}

export function AuthLoadingScreen() {
  return <SuspenseLoader variant="auth" />
}

/** Alias for clarity in new code */
export const SmartLoader = LoadingState

export function InlineLoading({
  message,
  className = '',
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`} role="status" aria-live="polite">
      <SmartLoaderMark size="sm" />
      {message && <span className="text-sm text-gray-600 dark:text-zinc-300">{message}</span>}
    </div>
  )
}
