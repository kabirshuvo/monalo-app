import EcoPenguinShell from '@/features/ecopenguin/components/EcoPenguinShell'
import EcoPenguinHub from '@/features/ecopenguin/components/EcoPenguinHub'
import { getEcoPenguinCategories } from '@/lib/ecopenguin/data'

export default async function EcoPenguinHomePage() {
  const categories = await getEcoPenguinCategories()

  return (
    <EcoPenguinShell>
      <EcoPenguinHub categories={categories} />
    </EcoPenguinShell>
  )
}
