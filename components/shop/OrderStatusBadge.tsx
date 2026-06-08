import Badge from '@/components/ui/Badge'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/shop/labels'
import type { OrderStatus, PaymentStatus } from '@prisma/client'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant =
    status === 'DELIVERED'
      ? 'success'
      : status === 'CANCELLED'
        ? 'danger'
        : status === 'SHIPPED' || status === 'PAID'
          ? 'info'
          : 'warning'
  return (
    <Badge variant={variant} size="sm">
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const variant =
    status === 'PAID' ? 'success' : status === 'REFUNDED' || status === 'FAILED' ? 'danger' : 'warning'
  return (
    <Badge variant={variant} size="sm">
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  )
}
