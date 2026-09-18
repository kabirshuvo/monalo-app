import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Blend the word · Eco Penguin · MonAlo',
  description: 'Hear a short word sound by sound, then tap the picture — Blend the word in Eco Penguin',
}

export default function BlendWordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
