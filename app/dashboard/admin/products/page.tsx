import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { prisma } from '@/lib/db'
import { formatPriceCents } from '@/lib/format'
import ProductStatusBadge from '@/components/shop/ProductStatusBadge'
import ProductRowActions from '@/components/shop/ProductRowActions'
import ProductCategoryBadge from '@/components/shop/ProductCategoryBadge'
import type { ShopCategoryId } from '@/lib/shop/categories'

export const metadata = {
  title: 'Shop Products - MonAlo Admin',
}

export default async function AdminProductsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role
  if (role !== 'ADMIN') redirect('/dashboard')

  const [products, counts] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    }),
  ])

  const activeCount = counts.find((c) => c.status === 'ACTIVE')?._count ?? 0

  return (
    <DashboardLayout
      userRole="ADMIN"
      userName={session.user.name || 'Admin'}
      currentPath="/dashboard/admin/products"
    >
      <div className="space-y-8">
        <div>
          <Link href="/dashboard/admin" className="text-sm text-blue-600 hover:underline">
            ← Admin dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-light text-gray-900">Shop products</h1>
          <p className="mt-2 text-gray-600">
            {products.length} listings · {activeCount} active in the public shop
          </p>
          <Link
            href="/dashboard/seller/products"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            Add or manage listings →
          </Link>
        </div>

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
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3">
                    <ProductCategoryBadge category={p.category as ShopCategoryId} />
                  </td>
                  <td className="px-4 py-3 text-sm">{formatPriceCents(p.price)}</td>
                  <td className="px-4 py-3 text-sm">{p.stock}</td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions slug={p.slug} name={p.name} canEdit />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
