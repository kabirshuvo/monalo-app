import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import EmptyState from '@/components/ui/EmptyState'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export const metadata = {
  title: 'My Orders - MonAlo',
}

export default async function CustomerOrdersPage() {
  const session = await auth()

  if (!session || !session.user) redirect('/login')
  const role = (session.user as any)?.role
  if (role !== 'CUSTOMER' && role !== 'ADMIN') redirect('/dashboard')

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/orders`, { cache: 'no-store' })
  const data = await res.json().catch(() => ({ ok: false }))
  const orders: any[] = data?.orders || []

  return (
    <DashboardLayout
      userRole={(role as 'CUSTOMER' | 'ADMIN') || 'CUSTOMER'}
      userName={session.user.name || 'Customer'}
      currentPath="/dashboard/customer/orders"
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Your Orders</h1>

        {orders.length === 0 ? (
          <Card>
            <EmptyState variant="orders" actionLabel="Start shopping" />
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">#{o.id}</div>
                          <div className="text-sm text-gray-500">{o.items?.length || 0} items</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4 font-medium text-gray-900">{formatPrice(o.totalAmount)}</td>
                        <td className="px-4 py-4">
                          <Badge variant={o.status === 'PAID' ? 'success' : o.status === 'SHIPPED' ? 'info' : 'default'}>
                            {o.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link href={`/dashboard/customer/orders/${o.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
