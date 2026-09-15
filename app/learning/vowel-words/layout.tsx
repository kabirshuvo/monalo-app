import type { Metadata } from 'next'
import ActivityTracker from '@/components/points/ActivityTracker'

export const metadata: Metadata = {
  title: 'Vowel Words · MonAlo',
  description: 'Short vowel CVC practice for kids — Vowel Words on MonAlo',
}

export default function VowelWordsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ActivityTracker type="learning" />
      {children}
    </>
  )
}
