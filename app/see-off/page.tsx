import React, { Suspense } from 'react'
import PublicLayout from '@/components/layouts/PublicLayout'
import SeeOffClient from './SeeOffClient'

export default function SeeOffPage() {
  return (
    <PublicLayout currentPath="">
      <Suspense fallback={<div />}> 
        <SeeOffClient />
      </Suspense>
    </PublicLayout>
  )
}
