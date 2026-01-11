/**
 * Centralized Role Definitions
 * 
 * This file contains all role constants and role-based configurations used throughout the app.
 * By centralizing role definitions, we avoid hardcoding role strings across the application
 * and make it easy to modify role structures in one place.
 * 
 * Usage:
 *   import { ROLES, ROLE_REQUIREMENTS } from '@/lib/auth/roles'
 *   
 *   await requireServerRole(ROLES.ADMIN)
 *   const isAdmin = userRole === ROLES.ADMIN
 */

import type { Role } from '@prisma/client'

/**
 * Role Constants
 * 
 * These match the Prisma Role enum and should be kept in sync
 * Use these constants instead of hardcoding role strings
 */
export const ROLES = {
  /**
   * Administrator
   * Can access all areas of the application
   * Highest privilege level
   */
  ADMIN: 'ADMIN' as const,

  /**
   * Content Writer/Creator
   * Can create and manage content (courses, blog posts)
   * Can access writer dashboard
   */
  WRITER: 'WRITER' as const,

  /**
   * Student/Course Learner
   * Can enroll in courses and view learning content
   * Can access learner dashboard
   */
  LEARNER: 'LEARNER' as const,

  /**
   * Shop Customer
   * Can browse and purchase products
   * Can access customer dashboard and order history
   */
  CUSTOMER: 'CUSTOMER' as const,
} as const

/**
 * Type for role values
 * Ensures type safety when working with roles
 * 
 * Usage:
 *   function checkRole(role: RoleType): boolean {
 *     return Object.values(ROLES).includes(role)
 *   }
 */
export type RoleType = typeof ROLES[keyof typeof ROLES]

/**
 * All available roles as an array
 * Useful for iteration and validation
 * 
 * Usage:
 *   const allRoles = ALL_ROLES // ['ADMIN', 'WRITER', 'LEARNER', 'CUSTOMER']
 *   const isValidRole = ALL_ROLES.includes(userRole)
 */
export const ALL_ROLES = Object.values(ROLES) as RoleType[]

/**
 * Role Descriptions
 * Human-readable descriptions for each role
 * Useful for UI displays and documentation
 */
export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  [ROLES.ADMIN]: 'Administrator - Full system access',
  [ROLES.WRITER]: 'Content Creator - Create and manage content',
  [ROLES.LEARNER]: 'Student - Enroll in courses',
  [ROLES.CUSTOMER]: 'Shopper - Purchase products',
}

/**
 * Route-to-Role Mapping for Middleware Protection
 * 
 * Defines which roles can access which dashboard routes
 * Used in middleware.ts to enforce access control
 * 
 * Update this object to:
 * - Add new protected routes
 * - Change role requirements for existing routes
 * - Manage role hierarchy
 * 
 * @example
 * ROLE_REQUIREMENTS['/dashboard/admin'] = [ROLES.ADMIN]
 * ROLE_REQUIREMENTS['/dashboard/writer'] = [ROLES.WRITER, ROLES.ADMIN]
 */
export const ROLE_REQUIREMENTS: Record<string, RoleType[]> = {
  /**
   * Admin Dashboard
   * Restricted to ADMIN role only
   * Access to system administration, analytics, user management
   */
  '/dashboard/admin': [ROLES.ADMIN],

  /**
   * Writer Dashboard
   * WRITER and ADMIN can access
   * Content creation and management tools
   */
  '/dashboard/writer': [ROLES.WRITER, ROLES.ADMIN],

  /**
   * Learner Dashboard
   * LEARNER role only
   * Course enrollment, progress tracking, learning tools
   */
  '/dashboard/learner': [ROLES.LEARNER],

  /**
   * Customer Dashboard
   * CUSTOMER role only
   * Order history, purchases, account settings
   */
  '/dashboard/customer': [ROLES.CUSTOMER],
}

/**
 * Permission Matrix
 * Defines what actions each role can perform
 * 
 * Useful for feature-level access control in UI and API routes
 * 
 * @example
 * if (PERMISSIONS[userRole].includes('create_course')) {
 *   // Show create course button
 * }
 */
export const PERMISSIONS: Record<RoleType, string[]> = {
  [ROLES.ADMIN]: [
    'view_analytics',
    'manage_users',
    'manage_products',
    'manage_courses',
    'manage_orders',
    'manage_blog',
    'system_settings',
    'create_course',
    'create_product',
  ],

  [ROLES.WRITER]: [
    'create_course',
    'edit_own_course',
    'create_blog',
    'edit_own_blog',
    'view_analytics',
  ],

  [ROLES.LEARNER]: [
    'enroll_course',
    'view_course',
    'complete_lesson',
    'view_progress',
    'download_resources',
  ],

  [ROLES.CUSTOMER]: [
    'browse_products',
    'view_product',
    'purchase_product',
    'view_orders',
    'track_shipment',
    'manage_wishlist',
  ],
}

/**
 * Check if a role has a specific permission
 * 
 * Usage:
 *   if (hasPermission(userRole, 'manage_users')) {
 *     // Allow user management
 *   }
 */
export function hasPermission(role: RoleType, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Get all permissions for a role
 * 
 * Usage:
 *   const adminPermissions = getPermissions(ROLES.ADMIN)
 */
export function getPermissions(role: RoleType): string[] {
  return PERMISSIONS[role] ?? []
}

/**
 * Check if a role can access a dashboard route
 * 
 * Usage:
 *   if (canAccessRoute('/dashboard/admin', userRole)) {
 *     // Allow access
 *   }
 */
export function canAccessRoute(route: string, role: RoleType): boolean {
  const requiredRoles = ROLE_REQUIREMENTS[route]
  if (!requiredRoles) {
    return false // Route not found in requirements
  }
  return requiredRoles.includes(role)
}

/**
 * Get description for a role
 * 
 * Usage:
 *   console.log(getRoleDescription(ROLES.ADMIN))
 *   // Output: "Administrator - Full system access"
 */
export function getRoleDescription(role: RoleType): string {
  return ROLE_DESCRIPTIONS[role] ?? 'Unknown Role'
}

/**
 * Validate if a value is a valid role
 * Useful for type guards and validation
 * 
 * Usage:
 *   if (isValidRole(userRole)) {
 *     // Safely use userRole as RoleType
 *   }
 */
export function isValidRole(value: unknown): value is RoleType {
  return ALL_ROLES.includes(value as RoleType)
}
