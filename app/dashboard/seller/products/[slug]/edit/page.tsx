import { auth } from '@/lib/auth-server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { prisma } from '@/lib/db'
import { canManageProduct } from '@/lib/shop/access'
import ProductForm from '@/components/shop/ProductForm'
import type { ShopCategoryId } from '@/lib/shop/categories'
import type { Role } from '@prisma/client'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    select: { name: true },
  })
  return { title: product ? `Edit ${product.name}` : 'Edit product' }
}

export default async function EditProductPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: Role }).role
  const userId = (session.user as { id?: string }).id
  if (role !== 'SELLER' && role !== 'ADMIN') redirect('/dashboard')
  if (!userId) redirect('/login')

  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
  })
  if (!product) notFound()
  if (!canManageProduct(role, userId, product)) redirect('/dashboard/seller/products')

  return (
    <DashboardLayout
      userRole={role === 'ADMIN' ? 'ADMIN' : 'SELLER'}
      userName={session.user.name || 'Seller'}
      currentPath="/dashboard/seller/products"
    >
      <div className="space-y-6">
        <Link href="/dashboard/seller/products" className="text-sm text-blue-600 hover:underline">
          ← Back to products
        </Link>
        <ProductForm
          mode="edit"
          slug={product.slug}
          initial={{
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl,
            status: product.status,
            category: product.category as ShopCategoryId,
          }}
        />
      </div>
    </DashboardLayout>
  )
}
