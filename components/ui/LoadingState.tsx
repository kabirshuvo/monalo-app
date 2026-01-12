"use client"
import React from 'react'
import Spinner from './Spinner'

export type LoadingStateVariant = 'global' | 'lesson' | 'course' | 'progress' | 'notes' | 'cart' | 'checkout' | 'order'

export interface LoadingStateProps {
  variant?: LoadingStateVariant
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

const variantMessages: Record<LoadingStateVariant, string> = {
  global: 'Just a moment...',
  lesson: 'Opening your lesson...',
  course: 'Preparing this course...',
  progress: 'Loading your progress...',
  notes: 'Gathering your notes...',
  cart: 'Updating your cart...',
  checkout: 'Preparing checkout...',
  order: 'Processing your order...'
}

export default function LoadingState({
  variant = 'global',
  message,
  size = 'md',
  fullScreen = false
}: LoadingStateProps) {
  const displayMessage = message ?? variantMessages[variant]

  const content = (
    <div 
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size={size} />
      <p className="text-gray-600 text-sm font-medium">
        {displayMessage}
      </p>
      <span className="sr-only">Loading content</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        {content}
      </div>
    )
  }

  return (
    <div className="py-16 px-4">
      {content}
    </div>
  )
}

// Inline Loading (for buttons, cards, etc.)
export function InlineLoading({ 
  message, 
  className = '' 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Spinner size="sm" />
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  )
}
