import Badge from '@/components/ui/Badge'
import { PRODUCT_STATUS_LABELS } from '@/lib/shop/labels'
import type { ProductStatus } from '@prisma/client'

export default function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const variant =
    status === 'ACTIVE' ? 'success' : status === 'INACTIVE' ? 'warning' : 'default'
  return (
    <Badge variant={variant} size="sm">
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  )
}
