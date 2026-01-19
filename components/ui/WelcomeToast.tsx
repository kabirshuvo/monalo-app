"use client"
import React from 'react'
import { useToast } from './Toast'

export default function WelcomeToast({
  message,
  onClose,
}: {
  message: string
  onClose?: () => void
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 text-gray-800 rounded-lg p-3 flex items-start gap-3">
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}

export function useWelcomeToast() {
  const { addToast } = useToast()

  const showWelcome = (message: string, duration = 4000) => {
    addToast('info', message, duration, { noIcon: true, neutral: true })
  }

  return { showWelcome }
}
