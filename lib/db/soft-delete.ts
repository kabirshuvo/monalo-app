/**
 * Utility functions for soft delete queries
 * Automatically excludes soft-deleted records from queries
 * 
 * Usage:
 *   const user = await prisma.user.findUnique({
 *     where: { id: 'user-123' },
 *     ...withoutDeleted() // Adds: where: { deletedAt: null }
 *   })
 */

/**
 * Add where clause to exclude soft-deleted records
 * Can be merged with other where conditions
 * @param customWhere - Optional additional where clause (will be AND'd with deletedAt: null)
 * @returns Object with where clause to exclude deletedAt !== null
 */
export function withoutDeleted(customWhere?: Record<string, any>) {
  if (customWhere) {
    return {
      where: {
        AND: [{ deletedAt: null }, customWhere],
      },
    }
  }
  return {
    where: { deletedAt: null },
  }
}

/**
 * Include soft-deleted records (return all records including deleted)
 * Useful when explicitly needing to view deleted data (admin tools)
 * @returns Object with no where clause (includes deleted)
 */
export function withDeleted() {
  return {}
}

/**
 * Only return soft-deleted records
 * Useful for trash/recycle bin views
 * @returns Object with where clause: deletedAt !== null
 */
export function onlyDeleted(customWhere?: Record<string, any>) {
  if (customWhere) {
    return {
      where: {
        AND: [{ deletedAt: { not: null } }, customWhere],
      },
    }
  }
  return {
    where: { deletedAt: { not: null } },
  }
}

/**
 * Soft delete a record (set deletedAt to now)
 * Use in API endpoints: PATCH /api/products/:id/delete
 */
export async function softDelete(
  model: any, // Prisma model (e.g., prisma.product)
  whereClause: Record<string, any>
) {
  return model.update({
    where: whereClause,
    data: { deletedAt: new Date() },
  })
}

/**
 * Restore a soft-deleted record
 * Use in API endpoints: PATCH /api/products/:id/restore
 */
export async function restoreDeleted(
  model: any, // Prisma model (e.g., prisma.product)
  whereClause: Record<string, any>
) {
  return model.update({
    where: whereClause,
    data: { deletedAt: null },
  })
}

/**
 * Permanently delete a soft-deleted record
 * Use in admin tools for final deletion
 */
export async function permanentlyDelete(
  model: any, // Prisma model (e.g., prisma.product)
  whereClause: Record<string, any>
) {
  return model.delete({
    where: whereClause,
  })
}

/**
 * Check if a record is soft-deleted
 * @param record - Object with deletedAt field
 * @returns true if record is soft-deleted
 */
export function isDeleted(record: { deletedAt: Date | null }): boolean {
  return record.deletedAt !== null
}

/**
 * Get deletion info for a record
 * @param record - Object with deletedAt, updatedBy fields
 * @returns Object with deletedAt and who deleted it (updatedBy at time of delete)
 */
export function getDeletionInfo(record: {
  deletedAt: Date | null
  updatedBy: string | null
}): { isDeleted: boolean; deletedAt: Date | null; deletedBy: string | null } {
  return {
    isDeleted: record.deletedAt !== null,
    deletedAt: record.deletedAt,
    deletedBy: record.deletedAt ? record.updatedBy : null, // updatedBy should reflect who deleted it
  }
}

/**
 * Query builder helpers for common soft-delete patterns
 */
export const SoftDeleteQueries = {
  /**
   * Find all active (non-deleted) records with custom where clause
   */
  findActive: (customWhere?: Record<string, any>) => withoutDeleted(customWhere),

  /**
   * Find all deleted records with custom where clause
   */
  findDeleted: (customWhere?: Record<string, any>) => onlyDeleted(customWhere),

  /**
   * Find all records including deleted
   */
  findAll: () => withDeleted(),

  /**
   * Count active records with custom where clause
   */
  countActive: (customWhere?: Record<string, any>) => ({
    where: {
      ...(customWhere && { ...customWhere }),
      deletedAt: null,
    },
  }),

  /**
   * Count deleted records with custom where clause
   */
  countDeleted: (customWhere?: Record<string, any>) => ({
    where: {
      ...(customWhere && { ...customWhere }),
      deletedAt: { not: null },
    },
  }),
}
