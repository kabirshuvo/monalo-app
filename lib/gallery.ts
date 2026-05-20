import type { ArtworkStatus } from '@prisma/client'

export const ARTWORK_STATUS_LABELS: Record<ArtworkStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending review',
  ACTIVE: 'For sale',
  SOLD: 'Sold',
  INACTIVE: 'Inactive',
}

export function isArtworkPurchasable(status: ArtworkStatus): boolean {
  return status === 'ACTIVE'
}
