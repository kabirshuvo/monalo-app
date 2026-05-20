import PublicLayout from '@/components/layouts/PublicLayout'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'Gallery - Monalo School',
  description: 'Art sales supporting Monalo School programs',
}

export default function GalleryPage() {
  return (
    <PublicLayout currentPath="/gallery">
      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-sm font-semibold text-blue-600">Gallery</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Art that funds the school</h1>
        <p className="text-gray-600 mt-4 max-w-xl mx-auto">
          Student and community artwork will be listed here soon. Every sale supports Monalo School.
        </p>
        <div className="mt-10">
          <EmptyState
            variant="blog"
            title="Gallery opening soon"
            description="We are preparing the first collection. Explore the craft shop or courses meanwhile."
          />
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/shop"><Button variant="secondary">Craft shop</Button></Link>
          <Link href="/courses"><Button>Courses</Button></Link>
        </div>
      </main>
    </PublicLayout>
  )
}
