import PublicLayout from '@/components/layouts/PublicLayout'
import ProductCard, { type Product } from '@/components/shop/ProductCard'
import EmptyState from '@/components/ui/EmptyState'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Craft Shop - Monalo School',
  description: 'Handmade crafts supporting Monalo School',
}

export default async function ShopPage() {
  const rows = await prisma.product.findMany({
    where: { deletedAt: null, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  })

  const products: Product[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
    badge: p.stock > 0 && p.stock < 5 ? 'Low stock' : undefined,
  }))

  return (
    <PublicLayout>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Craft Shop</p>
            <h1 className="text-3xl font-bold text-gray-900">Thoughtful tools & handmade crafts</h1>
            <p className="text-gray-600 mt-1">
              Every purchase supports Monalo School programs and students.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            variant="cart"
            title="No products yet"
            description="Sellers are adding craft items soon. Explore courses or the blog in the meantime."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}
