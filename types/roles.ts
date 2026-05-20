/**
 * Re-export Prisma Role as the app-wide role type.
 * Use ROLES from @/lib/auth/roles for constants.
 */
export { Role as AppRole } from '@prisma/client'
export type { Role } from '@prisma/client'
