import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import Button from '@/components/ui/Button'

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
  if (role !== 'SELLER' && role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout
      userRole={role === 'ADMIN' ? 'ADMIN' : 'SELLER'}
      userName={session.user.name || 'Seller'}
      currentPath="/dashboard/seller"
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Seller dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage craft products for the school shop. Revenue supports Monalo School.
          </p>
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
