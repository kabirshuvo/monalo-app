"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PublicLayout from '@/components/layouts/PublicLayout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui'
import Alert from '@/components/ui/Alert'
import EmptyState from '@/components/ui/EmptyState'
import { useCart } from '@/hooks/useCart'
import api from '@/lib/api'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, isEmpty, clear } = useCart()
  const [shippingAddress, setShippingAddress] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const placeOrder = async () => {
    if (isEmpty) return
    setIsPlacingOrder(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const payload = {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: shippingAddress || undefined
      }

      // Using stub route for now; replace with /api/orders when available
      const res = await api.post<{ ok: boolean; order: unknown }>("/api/shop", payload)

      if (res?.ok) {
        clear()
        setSuccessMessage("Order placed. We’ll keep you posted—thank you.")
      } else {
        setErrorMessage("We couldn’t place your order. Please try again.")
      }
    } catch (e) {
      setErrorMessage("Something unexpected happened. Please try again.")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (isEmpty) {
    return (
      <PublicLayout currentPath="/checkout">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <EmptyState
              variant="cart"
              actionLabel="Browse shop"
              onAction={() => router.push('/shop')}
            />
          </Card>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout currentPath="/checkout">
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review your items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200">
                {items.map(item => (
                  <li key={item.productId} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{formatPrice(item.price)} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping address (optional)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Add a delivery note or address if needed"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </CardContent>
          </Card>

          {errorMessage && (
            <Alert variant="danger" title="Something didn’t go as planned" className="mt-2">
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert variant="success" title="All set" className="mt-2">
              {successMessage}
            </Alert>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-500">Calculated later</span>
              </div>
            </CardContent>
            <CardFooter>
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <Button onClick={placeOrder} isLoading={isPlacingOrder} fullWidth>
                  Place order
                </Button>
                <Button variant="ghost" fullWidth onClick={() => router.push('/shop')}>
                  Keep shopping
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PublicLayout>
  )
}

