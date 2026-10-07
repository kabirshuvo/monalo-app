import { Suspense } from 'react'
import LandingHeaderClient from './landing/LandingHeaderClient'
import LandingHeroClient from './landing/LandingHeroClient'
import LandingPageSections from '@/components/landing/LandingPageSections'
import ParentSections from '@/components/landing/ParentSections'
import SessionResetOnSignOut from '@/components/auth/SessionResetOnSignOut'
import CosmosFooter from '@/components/cosmos/CosmosFooter'

// Force the root landing page to be statically rendered and public
export const dynamic = 'force-static'

export const metadata = {
  title: 'Eco Penguin phonics for young readers | MonAlo',
  description:
    'Eco Penguin teaches young children to read through short, playful phonics games. Try it free, no account needed. Made by Monalo School.',
}

export default function LaunchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <SessionResetOnSignOut />
      </Suspense>
      <LandingHeaderClient />

      <main className="flex-1">
        <LandingHeroClient />
        <ParentSections />
        <LandingPageSections />
      </main>

      <CosmosFooter />
    </div>
  )
}
