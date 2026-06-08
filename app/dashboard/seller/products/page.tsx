import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { prisma } from '@/lib/db'
import { formatPriceCents } from '@/lib/format'
import { canManageProduct } from '@/lib/shop/access'
import ProductForm from '@/components/shop/ProductForm'
import ProductStatusBadge from '@/components/shop/ProductStatusBadge'
import ProductRowActions from '@/components/shop/ProductRowActions'
import ProductCategoryBadge from '@/components/shop/ProductCategoryBadge'
import type { ShopCategoryId } from '@/lib/shop/categories'
import type { Role } from '@prisma/client'

export const metadata = {
  title: 'Manage Products - MonAlo',
}

export default async function SellerProductsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: Role }).role
  const userId = (session.user as { id?: string }).id
  if (role !== 'SELLER' && role !== 'ADMIN') redirect('/dashboard')
  if (!userId) redirect('/login')

  const products = await prisma.product.findMany({
    where:
      role === 'ADMIN'
        ? { deletedAt: null }
        : { deletedAt: null, createdBy: userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <DashboardLayout
      userRole={role === 'ADMIN' ? 'ADMIN' : 'SELLER'}
      userName={session.user.name || 'Seller'}
      currentPath="/dashboard/seller/products"
    >
      <div className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/dashboard/seller" className="text-sm text-blue-600 hover:underline">
              ← Seller dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-light text-gray-900">Products</h1>
            <p className="mt-2 text-gray-600">
              {role === 'ADMIN' ? 'All craft shop listings' : 'Your listings on the craft shop'}
            </p>
          </div>
          <Link href="/shop" className="text-sm font-medium text-blue-600 hover:underline">
            View public shop →
          </Link>
        </div>

        <ProductForm mode="create" />

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ProductCategoryBadge category={p.category as ShopCategoryId} />
                  </td>
                  <td className="px-4 py-3 text-sm">{formatPriceCents(p.price)}</td>
                  <td className="px-4 py-3 text-sm">{p.stock}</td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions
                      slug={p.slug}
                      name={p.name}
                      canEdit={canManageProduct(role, userId, p)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-500">No products yet. Add one above.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
