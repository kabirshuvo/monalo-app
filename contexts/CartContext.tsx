"use client"

/**
 * Cart Context
 * 
 * Manages shopping cart state with localStorage persistence.
 * No auth/sensitive data stored—only product IDs, names, prices, and quantities.
 * 
 * Usage:
 *   <CartProvider>
 *     <App />
 *   </CartProvider>
 *   
 *   // In a component:
 *   const cart = useCart()
 *   cart.add(product)
 *   cart.remove(productId)
 */

import React, { createContext, useCallback, useEffect, useState } from 'react'
import type { CartItem, Cart } from '@/lib/cart-types'

export interface CartContextType {
  items: CartItem[]
  total: number
  isEmpty: boolean
  itemCount: number
  add: (product: { id: string; name: string; price: number }) => void
  remove: (productId: string) => void
  update: (productId: string, quantity: number) => void
  clear: () => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'monalo-cart'

/**
 * Safe localStorage access for cart data
 */
function getStoredCart(): Cart {
  if (typeof window === 'undefined') {
    return { items: [], total: 0 }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { items: [], total: 0 }
    
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed.items)) {
      return { items: [], total: 0 }
    }
    
    return {
      items: parsed.items,
      total: parsed.total || 0
    }
  } catch {
    // Ignore parse errors, return empty cart
    return { items: [], total: 0 }
  }
}

function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getStoredCart()
    setCart(stored)
    setMounted(true)
  }, [])

  const add = useCallback((product: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.items.find((item) => item.productId === product.id)
      
      let newItems: CartItem[]
      if (existing) {
        newItems = prev.items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [
          ...prev.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
          }
        ]
      }

      const newCart = { items: newItems, total: calculateTotal(newItems) }
      saveCart(newCart)
      return newCart
    })
  }, [])

  const remove = useCallback((productId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((item) => item.productId !== productId)
      const newCart = { items: newItems, total: calculateTotal(newItems) }
      saveCart(newCart)
      return newCart
    })
  }, [])

  const update = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      remove(productId)
      return
    }

    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
      const newCart = { items: newItems, total: calculateTotal(newItems) }
      saveCart(newCart)
      return newCart
    })
  }, [remove])

  const clear = useCallback(() => {
    setCart({ items: [], total: 0 })
    saveCart({ items: [], total: 0 })
  }, [])

  const value: CartContextType = {
    items: cart.items,
    total: cart.total,
    isEmpty: cart.items.length === 0,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    add,
    remove,
    update,
    clear
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
