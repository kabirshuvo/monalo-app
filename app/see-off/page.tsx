import React, { Suspense } from 'react'
import PublicLayout from '@/components/layouts/PublicLayout'
import SeeOffClient from './SeeOffClient'
import { RouteLoader } from '@/components/ui/LoadingState'

export default function SeeOffPage() {
  return (
    <PublicLayout currentPath="">
      <Suspense fallback={<RouteLoader variant="page" className="min-h-[40vh]" />}> 
        <SeeOffClient />
      </Suspense>
    </PublicLayout>
  )
}
