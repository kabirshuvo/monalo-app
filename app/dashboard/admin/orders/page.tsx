import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { prisma } from '@/lib/db'
import { formatPriceCents } from '@/lib/format'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/shop/OrderStatusBadge'
import UpdateOrderForm from '@/components/shop/UpdateOrderForm'

export const metadata = {
  title: 'Shop Orders - MonAlo Admin',
}

export default async function AdminOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if ((session.user as { role?: string }).role !== 'ADMIN') redirect('/dashboard')

  const orders = await prisma.order.findMany({
    where: { deletedAt: null },
    include: {
      items: {
        where: { deletedAt: null },
        include: {
          product: { select: { name: true } },
          artwork: { select: { title: true } },
        },
      },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 40,
  })

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length

  return (
    <DashboardLayout
      userRole="ADMIN"
      userName={session.user.name || 'Admin'}
      currentPath="/dashboard/admin/orders"
    >
      <div className="space-y-8">
        <div>
          <Link href="/dashboard/admin" className="text-sm text-blue-600 hover:underline">
            ← Admin dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-light text-gray-900">Shop orders</h1>
          <p className="mt-2 text-gray-600">
            {orders.length} recent orders · {pendingCount} pending fulfillment
          </p>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      #{order.id.slice(-8).toUpperCase()} · {formatPriceCents(order.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.user.name ?? 'Customer'} ({order.user.email}) ·{' '}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                <ul className="mt-3 space-y-1 text-sm text-gray-700">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}× {item.product?.name ?? item.artwork?.title ?? 'Item'}
                    </li>
                  ))}
                </ul>

                {order.shippingAddress && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Ship to:</span> {order.shippingAddress}
                  </p>
                )}

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <UpdateOrderForm
                    orderId={order.id}
                    status={order.status}
                    paymentStatus={order.paymentStatus}
                    trackingNumber={order.trackingNumber}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
