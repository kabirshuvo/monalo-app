"use client"
import React from 'react'
import Button from './Button'

export type ErrorStateVariant = 
  | 'auth-not-found' 
  | 'auth-invalid' 
  | 'auth-expired'
  | 'network'
  | 'server'
  | 'permission'
  | 'not-found'
  | 'generic'

export interface ErrorStateProps {
  variant?: ErrorStateVariant
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

const variantContent: Record<ErrorStateVariant, { title: string; message: string; actionLabel?: string }> = {
  'auth-not-found': {
    title: 'Account not found',
    message: "We couldn't find an account with that email.",
    actionLabel: 'Try again'
  },
  'auth-invalid': {
    title: 'Please check your details',
    message: "That password doesn't match our records. Want to reset it?",
    actionLabel: 'Reset password'
  },
  'auth-expired': {
    title: 'Session expired',
    message: 'Your session has expired. Please sign in again.',
    actionLabel: 'Sign in'
  },
  network: {
    title: 'Connection trouble',
    message: "We're having trouble connecting. Please check your internet.",
    actionLabel: 'Try again'
  },
  server: {
    title: 'Something went wrong',
    message: "Something went wrong on our end. Please try again.",
    actionLabel: 'Try again'
  },
  permission: {
    title: 'Access restricted',
    message: "You don't have access to this page.",
    actionLabel: 'Go back'
  },
  'not-found': {
    title: 'Page not found',
    message: "We couldn't find what you're looking for.",
    actionLabel: 'Go home'
  },
  generic: {
    title: 'Something went wrong',
    message: "We couldn't complete that action. Please try again in a moment.",
    actionLabel: 'Try again'
  }
}

const errorIcons: Record<ErrorStateVariant, React.ReactNode> = {
  'auth-not-found': (
    <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'auth-invalid': (
    <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  'auth-expired': (
    <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  network: (
    <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  server: (
    <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  permission: (
    <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  'not-found': (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  generic: (
    <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export default function ErrorState({
  variant = 'generic',
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: ErrorStateProps) {
  const content = variantContent[variant]
  const displayTitle = title ?? content.title
  const displayMessage = message ?? content.message
  const displayActionLabel = actionLabel ?? content.actionLabel
  const icon = errorIcons[variant]

  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div className="mb-6">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>

      {/* Message */}
      <p className="text-gray-600 max-w-md mb-6">
        {displayMessage}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onAction && displayActionLabel && (
          <Button onClick={onAction} variant="primary">
            {displayActionLabel}
          </Button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <Button onClick={onSecondaryAction} variant="secondary">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

// Inline Error (for form fields, cards, etc.)
export function InlineError({ 
  message,
  className = '' 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div 
      className={`flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}
      role="alert"
    >
      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <p className="text-sm text-red-800">{message}</p>
    </div>
  )
}
