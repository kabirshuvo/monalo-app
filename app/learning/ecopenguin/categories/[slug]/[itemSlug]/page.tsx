import { notFound } from 'next/navigation'
import EcoPenguinShell from '@/features/ecopenguin/components/EcoPenguinShell'
import ItemCelebrate from '@/features/ecopenguin/components/ItemCelebrate'
import {
  getEcoPenguinCategoryBySlug,
  getEcoPenguinItemBySlug,
} from '@/lib/ecopenguin/data'

type PageProps = {
  params: Promise<{ slug: string; itemSlug: string }>
  searchParams: Promise<{ celebrate?: string }>
}

export default async function EcoPenguinItemPage({ params, searchParams }: PageProps) {
  const { slug, itemSlug } = await params
  const { celebrate } = await searchParams

  const category = await getEcoPenguinCategoryBySlug(slug)
  if (!category) notFound()

  const item = await getEcoPenguinItemBySlug(slug, itemSlug)
  if (!item) notFound()

  return (
    <EcoPenguinShell title={item.name} backHref={`/learning/ecopenguin/categories/${slug}`}>
      <ItemCelebrate
        category={category}
        item={item}
        showConfetti={celebrate === '1'}
      />
    </EcoPenguinShell>
  )
}
