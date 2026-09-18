import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import EcoPenguinShell from '@/features/ecopenguin/components/EcoPenguinShell'
import CategoryPlay from '@/features/ecopenguin/components/CategoryPlay'
import {
  getEcoPenguinCategoryBySlug,
  getEcoPenguinItemsByCategorySlug,
} from '@/lib/ecopenguin/data'
import { categorySlugToDisplayName } from '@/lib/ecopenguin/slug'
import { auth } from '@/lib/auth-server'
import { getEcoPenguinMastery } from '@/lib/points/service'
import { ecoTheme } from '@/features/ecopenguin/eco-theme'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; mode?: string }>
}

export default async function EcoPenguinCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page: pageParam, mode: modeParam } = await searchParams
  const category = await getEcoPenguinCategoryBySlug(slug)
  if (!category) notFound()

  const items = await getEcoPenguinItemsByCategorySlug(slug)
  const title = category.name || categorySlugToDisplayName(slug)
  const initialPage = Math.max(1, Number(pageParam) || 1)
  const initialMode = modeParam === 'play' ? 'play' : 'learn'

  const session = await auth()
  let masteredKeys: string[] = []
  if (session?.user?.id) {
    const mastery = await getEcoPenguinMastery(session.user.id)
    masteredKeys = mastery.masteredKeys.filter((key) => key.startsWith(`${slug}:`))
  }

  return (
    <EcoPenguinShell title={title} backHref="/learning/ecopenguin">
      {items.length === 0 ? (
        <div className={`${ecoTheme.cardSoft} space-y-2 py-12 text-center`}>
          <p className="text-4xl" aria-hidden>
            🐧
          </p>
          <p className="text-lg font-extrabold text-[#fafaf9]">No words here yet</p>
          <p className="text-sm text-[#d6d3d1]">Try another category from the hub.</p>
        </div>
      ) : (
        <Suspense
          fallback={
            <p className={`${ecoTheme.cardSoft} py-12 text-center font-semibold text-[#d6d3d1]`}>
              Loading game…
            </p>
          }
        >
          <CategoryPlay
            category={category}
            items={items}
            masteredKeys={masteredKeys}
            initialPage={initialPage}
            initialMode={initialMode}
          />
        </Suspense>
      )}
    </EcoPenguinShell>
  )
}
