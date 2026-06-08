import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import Button from '@/components/ui/Button'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Seller Dashboard - MonAlo',
  description: 'Manage craft shop products',
}

export default async function SellerDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const role = (session.user as { role?: string }).role
  const userId = (session.user as { id?: string }).id
  if (role !== 'SELLER' && role !== 'ADMIN') {
    redirect('/dashboard')
  }
  if (!userId) redirect('/login')

  const productWhere =
    role === 'ADMIN' ? { deletedAt: null } : { deletedAt: null, createdBy: userId }

  const [productCount, activeCount, orderCount] = await Promise.all([
    prisma.product.count({ where: productWhere }),
    prisma.product.count({ where: { ...productWhere, status: 'ACTIVE' } }),
    role === 'ADMIN'
      ? prisma.order.count({ where: { deletedAt: null } })
      : prisma.order.count({
          where: {
            deletedAt: null,
            items: {
              some: {
                deletedAt: null,
                product: { createdBy: userId, deletedAt: null },
              },
            },
          },
        }),
  ])

  return (
    <DashboardLayout
      userRole={role === 'ADMIN' ? 'ADMIN' : 'SELLER'}
      userName={session.user.name || 'Seller'}
      currentPath="/dashboard/seller"
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Seller dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage craft products for the school shop. Revenue supports Monalo School.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-3xl font-bold text-gray-900">{productCount}</p>
              <p className="text-xs text-gray-500 mt-1">{activeCount} live in shop</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-gray-600">Shop orders</p>
              <p className="text-3xl font-bold text-gray-900">{orderCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-gray-600">Public shop</p>
              <Link href="/shop" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
                Preview storefront →
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Create and edit listings for shop.monalo.school.
              </p>
              <Link href="/dashboard/seller/products">
                <Button>Manage products</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                See orders that include your craft items.
              </p>
              <Link href="/dashboard/seller/orders">
                <Button variant="secondary">View shop orders</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Submit art for the school gallery.</p>
              <Link href="/dashboard/seller/artworks">
                <Button variant="secondary">Manage artworks</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shop</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Preview the public craft shop.</p>
              <Link href="/shop">
                <Button variant="secondary">View shop</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
