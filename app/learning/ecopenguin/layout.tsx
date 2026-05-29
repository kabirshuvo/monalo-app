import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eco Penguin · MonAlo',
  description: 'Early English learning games for kids — Eco Penguin on MonAlo',
}

export default function EcoPenguinLayout({ children }: { children: React.ReactNode }) {
  return children
}
