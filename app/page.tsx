import { Suspense } from 'react'
import LandingHeaderClient from './landing/LandingHeaderClient'
import LandingHeroClient from './landing/LandingHeroClient'
import LandingPageSections from '@/components/landing/LandingPageSections'
import SessionResetOnSignOut from '@/components/auth/SessionResetOnSignOut'
import CosmosFooter from '@/components/cosmos/CosmosFooter'

// Force the root landing page to be statically rendered and public
export const dynamic = 'force-static'

export const metadata = {
  title: 'MonAlo — The whole school, in orbit',
  description:
    'Monalo School is the sun; courses, Eco Penguin phonics, a craft shop, a gallery and a freelance team orbit it. Every planet you visit helps students learn.',
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
        <LandingPageSections />
      </main>

      <CosmosFooter />
    </div>
  )
}
