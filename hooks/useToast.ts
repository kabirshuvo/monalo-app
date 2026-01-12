"use client"

/**
 * Toast notifications with MonAlo brand copy
 * 
 * Provides feedback for cart actions using calm, encouraging language.
 * No error alarm—just clear, supportive messages.
 */

import { useState, useCallback } from 'react'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)

    return id
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, add, remove }
}

/**
 * Brand-aligned cart action messages
 */
export const cartMessages = {
  // Success messages
  addedToCart: (name: string) => `Added ${name} to your cart.`,
  removedFromCart: (name: string) => `Removed ${name} from your cart.`,
  quantityUpdated: (name: string, qty: number) => `Updated ${name} to ${qty}.`,
  cartCleared: `Your cart is cleared.`,

  // Info messages
  browseMore: `Keep browsing for more items.`,
  emptyCart: `Your cart is empty. Explore what we have.`,
  
  // Warnings
  lowStock: (count: number) => `Only ${count} left in stock.`,
  quantityLimited: `Quantity has been adjusted to available stock.`,

  // Error messages (gentle, not alarming)
  unexpectedError: `Something unexpected happened. Please try again.`,
  updateFailed: `We couldn't update that. Give it another try.`,
  saveFailed: `Your cart didn't save. Try again when you get a moment.`
} as const
