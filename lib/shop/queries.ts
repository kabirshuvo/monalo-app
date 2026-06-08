import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { ShopCategoryId } from '@/lib/shop/categories'

const ACTIVE_PRODUCT_WHERE = {
  deletedAt: null,
  status: 'ACTIVE' as const,
}

const productListSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
  category: true,
} as const

const productListSelectLegacy = {
  id: true,
  slug: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
} as const

export type ShopProductRow = {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  category: ShopCategoryId
}

function isMissingCategoryColumn(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '')
  const lower = msg.toLowerCase()
  if (
    lower.includes('category') &&
    (lower.includes('does not exist') || lower.includes('unknown') || lower.includes('productcategory'))
  ) {
    return true
  }
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022'
}

function withDefaultCategory<T extends Omit<ShopProductRow, 'category'>>(
  row: T
): ShopProductRow {
  return { ...row, category: 'OTHER_CRAFT' }
}

export async function listActiveShopProducts(options?: {
  category?: ShopCategoryId
}): Promise<ShopProductRow[]> {
  const where = {
    ...ACTIVE_PRODUCT_WHERE,
    ...(options?.category ? { category: options.category } : {}),
  }

  try {
    const rows = await prisma.product.findMany({
      where,
      select: productListSelect,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => ({
      ...row,
      category: row.category as ShopCategoryId,
    }))
  } catch (error) {
    if (!isMissingCategoryColumn(error)) throw error
  }

  const rows = await prisma.product.findMany({
    where: ACTIVE_PRODUCT_WHERE,
    select: productListSelectLegacy,
    orderBy: { createdAt: 'desc' },
  })

  return rows.map(withDefaultCategory)
}

export async function getActiveShopProductBySlug(
  slug: string
): Promise<(ShopProductRow & { images: { id: string; url: string; alt: string | null; order: number }[] }) | null> {
  try {
    const product = await prisma.product.findFirst({
      where: { slug, ...ACTIVE_PRODUCT_WHERE },
      select: {
        ...productListSelect,
        images: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          select: { id: true, url: true, alt: true, order: true },
        },
      },
    })
    if (!product) return null
    return {
      ...product,
      category: product.category as ShopCategoryId,
    }
  } catch (error) {
    if (!isMissingCategoryColumn(error)) throw error
  }

  const product = await prisma.product.findFirst({
    where: { slug, ...ACTIVE_PRODUCT_WHERE },
    select: {
      ...productListSelectLegacy,
      images: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
        select: { id: true, url: true, alt: true, order: true },
      },
    },
  })
  if (!product) return null
  return { ...withDefaultCategory(product), images: product.images }
}

export function shopCategoryCounts(products: ShopProductRow[]): Record<string, number> {
  const counts: Record<string, number> = { all: products.length }
  for (const product of products) {
    counts[product.category] = (counts[product.category] ?? 0) + 1
  }
  return counts
}
