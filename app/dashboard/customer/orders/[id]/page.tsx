import { auth } from '@/lib/auth-server'
import { notFound, redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'
import Badge from '@/components/ui/Badge'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export const metadata = {
  title: 'Order Details - MonAlo',
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user) redirect('/login')
  const role = (session.user as any)?.role
  if (role !== 'CUSTOMER' && role !== 'ADMIN') redirect('/dashboard')

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/orders/${params.id}`, { cache: 'no-store' })
  if (res.status === 404) notFound()
  const data = await res.json().catch(() => ({ ok: false }))
  const order: any | undefined = data?.order
  if (!order) notFound()

  return (
    <DashboardLayout
      userRole={(role as 'CUSTOMER' | 'ADMIN') || 'CUSTOMER'}
      userName={session.user.name || 'Customer'}
      currentPath="/dashboard/customer/orders"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
          <Badge variant={order.status === 'PAID' ? 'success' : order.status === 'SHIPPED' ? 'info' : 'default'}>
            {order.status}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200">
              {order.items?.map((item: any) => (
                <li key={item.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.product?.name || item.productId}</p>
                    <p className="text-sm text-gray-600">{formatPrice(item.priceSnapshot)} × {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <div className="ml-auto w-full max-w-sm space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.items?.reduce((s: number, i: any) => s + i.subtotal, 0) || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600">Placed</dt>
                <dd className="font-medium">{new Date(order.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Payment</dt>
                <dd className="font-medium">{order.paymentStatus}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
