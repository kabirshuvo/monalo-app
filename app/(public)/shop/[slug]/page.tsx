import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicLayout from '@/components/layouts/PublicLayout'
import { prisma } from '@/lib/db'
import { formatPriceCents } from '@/lib/format'
import ProductDetailClient from './ProductDetailClient'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null, status: 'ACTIVE' },
  })
  if (!product) return { title: 'Product not found' }
  return {
    title: `${product.name} - Monalo Shop`,
    description: product.description ?? undefined,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null, status: 'ACTIVE' },
    include: {
      images: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
    },
  })

  if (!product) notFound()

  return (
    <PublicLayout>
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/shop" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Back to shop
        </Link>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No image</div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-2xl font-semibold text-gray-800 mt-2">
                {formatPriceCents(product.price)}
              </p>
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            <p className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>

            <ProductDetailClient
              productId={product.id}
              name={product.name}
              price={product.price}
              inStock={product.stock > 0}
            />
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
