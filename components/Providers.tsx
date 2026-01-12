"use client"
import React from 'react'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/components/ui'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ToastProvider>
  )
}
