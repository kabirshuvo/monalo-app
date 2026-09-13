import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicLayout from '@/components/layouts/PublicLayout'
import ProductHeroGallery from '@/components/shop/ProductHeroGallery'
import { getActiveShopProductBySlug } from '@/lib/shop/queries'
import { resolveProductDisplayImages } from '@/lib/shop/product-images'
import type { ShopCategoryId } from '@/lib/shop/categories'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = await getActiveShopProductBySlug(slug)
  if (!product) return { title: 'Product not found' }
  return {
    title: `${product.name} - Monalo Shop`,
    description: product.description ?? undefined,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getActiveShopProductBySlug(slug)

  if (!product) notFound()

  const images = resolveProductDisplayImages(product)

  return (
    <PublicLayout>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
        <Link href="/shop" className="mb-6 inline-block text-sm text-blue-600 hover:underline">
          ← Back to craft shop
        </Link>

        <ProductHeroGallery
          productId={product.id}
          name={product.name}
          description={product.description}
          price={product.price}
          stock={product.stock}
          category={product.category as ShopCategoryId}
          images={images}
        />

        {product.description ? (
          <section className="mt-10 max-w-3xl">
            <h2 className="text-lg font-semibold text-gray-900">About this piece</h2>
            <p className="mt-3 leading-relaxed text-gray-600">{product.description}</p>
          </section>
        ) : null}
      </main>
    </PublicLayout>
  )
}
