"use client"
import React from 'react'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/components/ui'
import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  )
}
