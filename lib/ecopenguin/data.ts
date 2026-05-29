import { readFile } from 'fs/promises'
import path from 'path'
import { resolveEcoPenguinAsset } from '@/lib/ecopenguin/assets'
import { categoryNameToSlug, itemNameToSlug } from '@/lib/ecopenguin/slug'
import type {
  EcoPenguinCategory,
  EcoPenguinCategoryMeta,
  EcoPenguinItem,
} from '@/lib/ecopenguin/types'

const DATA_DIR = path.join(process.cwd(), 'data', 'ecopenguin')

type ItemsJson = Record<string, EcoPenguinItem[]>

function mapCategory(meta: EcoPenguinCategoryMeta): EcoPenguinCategory {
  return {
    ...meta,
    slug: categoryNameToSlug(meta.name),
    image: resolveEcoPenguinAsset(meta.image),
  }
}

function mapItem(item: EcoPenguinItem): EcoPenguinItem {
  return {
    ...item,
    image: resolveEcoPenguinAsset(item.image),
    audio: {
      itemAudio: resolveEcoPenguinAsset(item.audio.itemAudio),
      question: resolveEcoPenguinAsset(item.audio.question),
      success: resolveEcoPenguinAsset(item.audio.success),
      error: resolveEcoPenguinAsset(item.audio.error),
      warning: resolveEcoPenguinAsset(item.audio.warning),
    },
  }
}

async function readCategoriesFile(): Promise<EcoPenguinCategoryMeta[]> {
  const raw = await readFile(path.join(DATA_DIR, 'categories.json'), 'utf-8')
  return JSON.parse(raw) as EcoPenguinCategoryMeta[]
}

async function readItemsFile(): Promise<ItemsJson> {
  const raw = await readFile(path.join(DATA_DIR, 'items.json'), 'utf-8')
  return JSON.parse(raw) as ItemsJson
}

export async function getEcoPenguinCategories(): Promise<EcoPenguinCategory[]> {
  const categories = await readCategoriesFile()
  return categories.map(mapCategory)
}

export async function getEcoPenguinCategoryBySlug(
  slug: string
): Promise<EcoPenguinCategory | null> {
  const categories = await getEcoPenguinCategories()
  return categories.find((c) => c.slug === slug) ?? null
}

export async function getEcoPenguinItemsByCategorySlug(slug: string): Promise<EcoPenguinItem[]> {
  const itemsByCategory = await readItemsFile()
  const key = slug.toLowerCase()
  const items = itemsByCategory[key] ?? []
  return items.map(mapItem)
}

export async function getEcoPenguinItemBySlug(
  categorySlug: string,
  itemSlug: string
): Promise<EcoPenguinItem | null> {
  const items = await getEcoPenguinItemsByCategorySlug(categorySlug)
  return items.find((i) => itemNameToSlug(i.name) === itemSlug) ?? null
}
