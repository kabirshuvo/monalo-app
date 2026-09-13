export const dynamic = 'force-dynamic'

import Link from 'next/link'
import PublicLayout from '@/components/layouts/PublicLayout'
import ProductCard, { type Product } from '@/components/shop/ProductCard'
import ShopHero from '@/components/shop/ShopHero'
import EmptyState from '@/components/ui/EmptyState'
import {
  SHOP_CATEGORIES,
  CATEGORY_ACCENT_CLASSES,
  parseShopCategorySlug,
  type ShopCategoryId,
} from '@/lib/shop/categories'
import {
  listActiveShopProducts,
  shopCategoryCounts,
} from '@/lib/shop/queries'

export const metadata = {
  title: 'Craft Shop - Monalo School',
  description: 'Handmade crafts, books, gypsum pottery, candles, wood & bamboo from Monalo School',
}

type ShopPageProps = {
  searchParams: Promise<{ category?: string }>
}

function toProduct(p: {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  category: ShopCategoryId
}): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
    category: p.category,
    badge: p.stock > 0 && p.stock < 5 ? 'Low stock' : undefined,
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category: categoryParam } = await searchParams
  const activeCategory = parseShopCategorySlug(categoryParam)

  const allRows = await listActiveShopProducts()
  const counts = shopCategoryCounts(allRows)

  // Filtered single-category view (from popup “Open”)
  if (activeCategory) {
    const products = allRows
      .filter((p) => p.category === activeCategory.id)
      .map((p) => toProduct({ ...p, category: p.category as ShopCategoryId }))

    return (
      <PublicLayout>
        <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <ShopHero counts={counts} />

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                <span aria-hidden className="mr-1">
                  {activeCategory.emoji}
                </span>
                {activeCategory.label}
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {activeCategory.heading}
              </h2>
              <p className="mt-2 max-w-2xl text-gray-600">{activeCategory.description}</p>
            </div>
            <Link href="/shop" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              ← All shelves
            </Link>
          </div>

          <div className="mt-8">
            {products.length === 0 ? (
              <EmptyState
                variant="cart"
                title={`No ${activeCategory.label.toLowerCase()} yet`}
                description="Check back soon — our artisans add new pieces regularly."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </main>
      </PublicLayout>
    )
  }

  const shelves = SHOP_CATEGORIES.map((category) => ({
    category,
    products: allRows
      .filter((p) => p.category === category.id)
      .map((p) => toProduct({ ...p, category: p.category as ShopCategoryId })),
  })).filter((shelf) => shelf.products.length > 0)

  return (
    <PublicLayout>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <ShopHero counts={counts} />

        <div id="shop-shelves" className="mt-14 scroll-mt-24 space-y-16">
          {shelves.length === 0 ? (
            <EmptyState
              variant="cart"
              title="No products yet"
              description="Sellers are adding craft items soon. Explore courses or the blog in the meantime."
            />
          ) : (
            shelves.map(({ category, products }) => {
              const accent = CATEGORY_ACCENT_CLASSES[category.accent]
              return (
                <section
                  key={category.id}
                  id={`shelf-${category.slug}`}
                  className="scroll-mt-24"
                >
                  <div
                    className={`rounded-3xl border bg-gradient-to-br p-6 sm:p-8 ${accent.card}`}
                  >
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-gray-700">
                          <span aria-hidden className="mr-1">
                            {category.emoji}
                          </span>
                          {category.label}
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                          {category.heading}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 sm:text-base">
                          {category.subheading}
                        </p>
                      </div>
                      <Link
                        href={`/shop?category=${category.slug}`}
                        className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-white"
                      >
                        View all ({products.length})
                      </Link>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                </section>
              )
            })
          )}
        </div>
      </main>
    </PublicLayout>
  )
}
