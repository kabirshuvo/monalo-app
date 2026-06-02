"use client"
import React from 'react'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/components/ui'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
