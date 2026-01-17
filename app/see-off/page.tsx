import PublicLayout from '@/components/layouts/PublicLayout'
import dynamic from 'next/dynamic'

const SeeOffClient = dynamic(() => import('./SeeOffClient'), { ssr: false })

export default function SeeOffPage() {
  return (
    <PublicLayout currentPath="">
      <SeeOffClient />
    </PublicLayout>
  )
}
