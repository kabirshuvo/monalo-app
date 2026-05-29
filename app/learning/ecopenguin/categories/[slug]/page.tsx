import { notFound } from 'next/navigation'
import EcoPenguinShell from '@/features/ecopenguin/components/EcoPenguinShell'
import CategoryPlay from '@/features/ecopenguin/components/CategoryPlay'
import {
  getEcoPenguinCategoryBySlug,
  getEcoPenguinItemsByCategorySlug,
} from '@/lib/ecopenguin/data'
import { categorySlugToDisplayName } from '@/lib/ecopenguin/slug'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function EcoPenguinCategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getEcoPenguinCategoryBySlug(slug)
  if (!category) notFound()

  const items = await getEcoPenguinItemsByCategorySlug(slug)
  const title = category.name || categorySlugToDisplayName(slug)

  return (
    <EcoPenguinShell title={title}>
      {items.length === 0 ? (
        <p className="text-center text-teal-800 py-12">No words in this category yet.</p>
      ) : (
        <CategoryPlay category={category} items={items} />
      )}
    </EcoPenguinShell>
  )
}
