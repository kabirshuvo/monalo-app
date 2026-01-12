import PublicLayout from '@/components/layouts/PublicLayout'
import ProductCard, { Product } from '@/components/shop/ProductCard'
import EmptyState from '@/components/ui/EmptyState'

const products: Product[] = [
  {
    id: 'p-101',
    name: 'Calm Focus Headphones',
    description: 'Noise-cancelling, all-day comfort, and tuned for deep work sessions.',
    price: '$189',
    badge: 'New'
  },
  {
    id: 'p-102',
    name: 'MonAlo Notebook',
    description: 'Lays flat, bleed-resistant paper, and a subtle grid for clean sketches.',
    price: '$18',
    badge: 'Bestseller'
  },
  {
    id: 'p-103',
    name: 'Ceramic Mug',
    description: 'Keeps your brew warm, feels great in hand, and looks calm on your desk.',
    price: '$22'
  }
]

export default function ShopPage() {
  const handleAdd = (id: string) => {
    console.log(`Add to cart: ${id}`)
  }

  return (
    <PublicLayout>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Shop</p>
            <h1 className="text-3xl font-bold text-gray-900">Thoughtful tools for learning</h1>
            <p className="text-gray-600 mt-1">Curated items that make your study sessions calmer and more focused.</p>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            variant="cart"
            title="No products just yet"
            description="We are still preparing a few favorites. Check back soon or explore our courses while we finish setting the shelf."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}
