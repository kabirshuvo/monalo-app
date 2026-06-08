export const dynamic = 'force-dynamic'

import PublicLayout from '@/components/layouts/PublicLayout'
import ProductCard, { type Product } from '@/components/shop/ProductCard'
import ShopCategoryNav from '@/components/shop/ShopCategoryNav'
import EmptyState from '@/components/ui/EmptyState'
import { parseShopCategorySlug, type ShopCategoryId } from '@/lib/shop/categories'
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

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category: categoryParam } = await searchParams
  const activeCategory = parseShopCategorySlug(categoryParam)

  const allRows = await listActiveShopProducts()
  const counts = shopCategoryCounts(allRows)
  const rows = activeCategory
    ? allRows.filter((p) => p.category === activeCategory.id)
    : allRows

  const products: Product[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
    category: p.category as ShopCategoryId,
    badge: p.stock > 0 && p.stock < 5 ? 'Low stock' : undefined,
  }))

  return (
    <PublicLayout>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 space-y-3">
          <p className="text-sm font-semibold text-blue-600">MonAlo Craft Shop</p>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeCategory ? activeCategory.heading : 'Handmade at Monalo School'}
          </h1>
          <p className="max-w-2xl text-gray-600">
            {activeCategory
              ? activeCategory.description
              : 'Gypsum pottery, decorative candles, wood and bamboo crafts — every purchase supports students and programs at Monalo School.'}
          </p>
        </div>

        <ShopCategoryNav
          activeSlug={activeCategory?.slug}
          counts={counts}
        />

        <div className="mt-10">
          {products.length === 0 ? (
            <EmptyState
              variant="cart"
              title={activeCategory ? `No ${activeCategory.label.toLowerCase()} yet` : 'No products yet'}
              description={
                activeCategory
                  ? 'Check back soon — our artisans add new pieces regularly. Browse other categories above.'
                  : 'Sellers are adding craft items soon. Explore courses or the blog in the meantime.'
              }
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
