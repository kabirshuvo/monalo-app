import { NextResponse } from 'next/server'

function sampleOrders() {
  const now = new Date()
  const earlier = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)
  return [
    {
      id: 'ord_1001',
      userId: 'demo_user',
      status: 'PAID',
      totalAmount: 7800,
      paymentStatus: 'PAID',
      createdAt: earlier.toISOString(),
      updatedAt: earlier.toISOString(),
      items: [
        {
          id: 'itm_1',
          orderId: 'ord_1001',
          productId: 'p-1',
          quantity: 1,
          priceSnapshot: 3000,
          subtotal: 3000,
          product: { id: 'p-1', name: 'MonAlo Mug' }
        },
        {
          id: 'itm_2',
          orderId: 'ord_1001',
          productId: 'p-2',
          quantity: 2,
          priceSnapshot: 2400,
          subtotal: 4800,
          product: { id: 'p-2', name: 'Notebook' }
        }
      ]
    },
    {
      id: 'ord_1002',
      userId: 'demo_user',
      status: 'SHIPPED',
      totalAmount: 2200,
      paymentStatus: 'PAID',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      items: [
        {
          id: 'itm_3',
          orderId: 'ord_1002',
          productId: 'p-3',
          quantity: 1,
          priceSnapshot: 2200,
          subtotal: 2200,
          product: { id: 'p-3', name: 'Enamel Pin' }
        }
      ]
    }
  ]
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const orders = sampleOrders()
  const order = orders.find((o) => o.id === id)
  if (!order) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true, order })
}
