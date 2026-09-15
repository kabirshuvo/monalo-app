import EcoPenguinShell from '@/features/ecopenguin/components/EcoPenguinShell'
import EcoPenguinHub from '@/features/ecopenguin/components/EcoPenguinHub'
import {
  getEcoPenguinCategories,
  getEcoPenguinItemsByCategorySlug,
} from '@/lib/ecopenguin/data'
import { auth } from '@/lib/auth-server'
import { getEcoPenguinMastery } from '@/lib/points/service'

export default async function EcoPenguinHomePage() {
  const categories = await getEcoPenguinCategories()
  const session = await auth()

  let progress: { slug: string; name: string; total: number; mastered: number }[] = []

  if (session?.user?.id) {
    const mastery = await getEcoPenguinMastery(session.user.id)
    progress = await Promise.all(
      categories.map(async (category) => {
        const items = await getEcoPenguinItemsByCategorySlug(category.slug)
        return {
          slug: category.slug,
          name: category.name,
          total: items.length,
          mastered: Math.min(mastery.byCategory[category.slug] ?? 0, items.length),
        }
      })
    )
  }

  return (
    <EcoPenguinShell>
      <EcoPenguinHub categories={categories} progress={progress} />
    </EcoPenguinShell>
  )
}
