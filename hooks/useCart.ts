"use client"

/**
 * useCart hook
 * 
 * Provides access to cart state and actions.
 * 
 * Usage:
 *   const cart = useCart()
 *   cart.add({ id: 'p-1', name: 'Mug', price: 2200 })
 *   cart.remove('p-1')
 *   cart.update('p-1', 2)
 *   cart.clear()
 */

import { useContext } from 'react'
import { CartContext, type CartContextType } from '@/contexts/CartContext'

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
