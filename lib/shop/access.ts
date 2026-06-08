import type { Product, Role } from '@prisma/client'

export function canManageProduct(
  role: Role | string | undefined,
  userId: string | undefined,
  product: Pick<Product, 'createdBy'>
): boolean {
  if (role === 'ADMIN') return true
  if (role === 'SELLER' && userId && product.createdBy === userId) return true
  return false
}
