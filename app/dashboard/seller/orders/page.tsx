import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { prisma } from '@/lib/db'
import { formatPriceCents } from '@/lib/format'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/shop/OrderStatusBadge'
import type { Role } from '@prisma/client'

export const metadata = {
  title: 'Shop Orders - MonAlo Seller',
}

export default async function SellerOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: Role }).role
  const userId = (session.user as { id?: string }).id
  if (role !== 'SELLER' && role !== 'ADMIN') redirect('/dashboard')
  if (!userId) redirect('/login')

  const orders = await prisma.order.findMany({
    where:
      role === 'ADMIN'
        ? { deletedAt: null }
        : {
            deletedAt: null,
            items: {
              some: {
                deletedAt: null,
                product: { createdBy: userId, deletedAt: null },
              },
            },
          },
    include: {
      items: {
        where: { deletedAt: null },
        include: {
          product: { select: { name: true, slug: true, createdBy: true } },
        },
      },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <DashboardLayout
      userRole={role === 'ADMIN' ? 'ADMIN' : 'SELLER'}
      userName={session.user.name || 'Seller'}
      currentPath="/dashboard/seller/orders"
    >
      <div className="space-y-8">
        <div>
          <Link href="/dashboard/seller" className="text-sm text-blue-600 hover:underline">
            ← Seller dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-light text-gray-900">Shop orders</h1>
          <p className="mt-2 text-gray-600">
            {role === 'ADMIN'
              ? 'All craft shop orders'
              : 'Orders that include your products'}
          </p>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No shop orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const myItems =
                role === 'ADMIN'
                  ? order.items.filter((i) => i.product)
                  : order.items.filter((i) => i.product?.createdBy === userId)
              return (
                <article
                  key={order.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.user.name ?? 'Customer'} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-gray-700">
                    {myItems.map((item) => (
                      <li key={item.id}>
                        {item.quantity}× {item.product?.name ?? 'Item'} —{' '}
                        {formatPriceCents(item.subtotal)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm font-semibold text-gray-900">
                    Order total: {formatPriceCents(order.totalAmount)}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
