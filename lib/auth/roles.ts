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
 * Route-to-Role Mapping for Complete Access Control
 * 
 * CENTRALIZED ROUTE PERMISSION MAP - Single Source of Truth
 * 
 * This map defines all protected routes and their role requirements.
 * Used for:
 * - Middleware: Coarse authentication check (is token valid?)
 * - Page-level guards: Fine-grained authorization (does user have role?)
 * - UI: Conditional rendering (show link if user has permission?)
 * - Documentation: Route permission matrix
 * 
 * Architecture:
 * 1. Middleware checks: Is user authenticated? (edge layer)
 * 2. Server component checks: Does user have required role? (authoritative layer)
 * 3. UI conditionally renders based on user role
 * 
 * Update this object to:
 * - Add new protected routes
 * - Change role requirements for existing routes
 * - Manage role hierarchy and inheritance
 * 
 * Format: '/route/path' → [ROLES.REQUIRED, ROLES.SECONDARY]
 */
export const ROLE_REQUIREMENTS: Record<string, RoleType[]> = {
  // ==========================================
  // DASHBOARD ROUTES
  // ==========================================
  // Each dashboard is isolated to a specific role
  // Multiple roles can access same dashboard if needed
  
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
   * Note: ADMIN can manage all writers' content
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
  
  // ==========================================
  // FUTURE ROUTES - Templates for new routes
  // ==========================================
  // Uncomment and customize as needed
  
  // '/admin/users': [ROLES.ADMIN],
  // '/admin/analytics': [ROLES.ADMIN],
  // '/admin/settings': [ROLES.ADMIN],
  // '/courses/create': [ROLES.WRITER, ROLES.ADMIN],
  // '/account/settings': [ROLES.ADMIN, ROLES.WRITER, ROLES.LEARNER, ROLES.CUSTOMER],
}

/**
 * Route Metadata - Enhanced Route Configuration
 * 
 * Provides additional context for each route beyond just role requirements
 * Useful for:
 * - Generating navigation menus
 * - Displaying permission denied messages
 * - Route documentation
 * - Breadcrumb generation
 */
export interface RouteConfig {
  path: string
  roles: RoleType[]
  label: string // Display name for breadcrumbs, menus
  description: string // What this route does
  requiresAuth: boolean // Must user be logged in?
  public: boolean // Publicly accessible?
}

/**
 * Enhanced route configuration with metadata
 * 
 * Usage:
 *   const route = ROUTE_METADATA['/dashboard/admin']
 *   if (route) {
 *     console.log(`This route requires: ${route.roles.join(', ')}`)
 *   }
 */
export const ROUTE_METADATA: Record<string, RouteConfig> = {
  '/dashboard/admin': {
    path: '/dashboard/admin',
    roles: [ROLES.ADMIN],
    label: 'Admin Dashboard',
    description: 'System administration and analytics',
    requiresAuth: true,
    public: false,
  },
  '/dashboard/writer': {
    path: '/dashboard/writer',
    roles: [ROLES.WRITER, ROLES.ADMIN],
    label: 'Writer Dashboard',
    description: 'Content creation and management',
    requiresAuth: true,
    public: false,
  },
  '/dashboard/learner': {
    path: '/dashboard/learner',
    roles: [ROLES.LEARNER],
    label: 'Learner Dashboard',
    description: 'Course enrollment and progress',
    requiresAuth: true,
    public: false,
  },
  '/dashboard/customer': {
    path: '/dashboard/customer',
    roles: [ROLES.CUSTOMER],
    label: 'Customer Dashboard',
    description: 'Shopping and order management',
    requiresAuth: true,
    public: false,
  },
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

/**
 * Get route metadata by path
 * 
 * Usage:
 *   const meta = getRouteMetadata('/dashboard/admin')
 *   console.log(meta?.label) // "Admin Dashboard"
 */
export function getRouteMetadata(path: string): RouteConfig | undefined {
  return ROUTE_METADATA[path]
}

/**
 * Get all roles required for a route
 * 
 * Usage:
 *   const roles = getRouteRoles('/dashboard/writer')
 *   // Returns: ['WRITER', 'ADMIN']
 */
export function getRouteRoles(path: string): RoleType[] {
  return ROLE_REQUIREMENTS[path] ?? []
}

/**
 * Check if a role can access a specific route
 * (Alternative to canAccessRoute with clearer semantics)
 * 
 * Usage:
 *   if (roleCanAccessRoute(userRole, '/dashboard/admin')) {
 *     // Show navigation link
 *   }
 */
export function roleCanAccessRoute(role: RoleType, path: string): boolean {
  return canAccessRoute(path, role)
}

/**
 * Get all routes accessible by a specific role
 * Useful for generating role-specific navigation menus
 * 
 * Usage:
 *   const writerRoutes = getAccessibleRoutes(ROLES.WRITER)
 *   // Returns: ['/dashboard/writer']
 */
export function getAccessibleRoutes(role: RoleType): string[] {
  return Object.entries(ROLE_REQUIREMENTS)
    .filter(([_path, roles]) => roles.includes(role))
    .map(([path]) => path)
}

/**
 * Get route display label for breadcrumbs and navigation
 * 
 * Usage:
 *   const label = getRouteLabel('/dashboard/admin')
 *   // Returns: "Admin Dashboard"
 */
export function getRouteLabel(path: string): string {
  return getRouteMetadata(path)?.label ?? path
}

/**
 * Get route description for permission denied messages
 * 
 * Usage:
 *   const desc = getRouteDescription('/dashboard/admin')
 *   // Returns: "System administration and analytics"
 */
export function getRouteDescription(path: string): string {
  return getRouteMetadata(path)?.description ?? 'Protected resource'
}

/**
 * Check if a route requires authentication
 * 
 * Usage:
 *   if (routeRequiresAuth('/dashboard/admin')) {
 *     // Redirect unauthenticated users to login
 *   }
 */
export function routeRequiresAuth(path: string): boolean {
  return ROUTE_METADATA[path]?.requiresAuth ?? ROLE_REQUIREMENTS[path] !== undefined
}

/**
 * Get all protected routes in the application
 * Useful for generating documentation or permission matrix
 * 
 * Usage:
 *   const allRoutes = getAllProtectedRoutes()
 *   // Returns: ['/dashboard/admin', '/dashboard/writer', ...]
 */
export function getAllProtectedRoutes(): string[] {
  return Object.keys(ROLE_REQUIREMENTS)
}

/**
 * Generate a permission matrix for documentation
 * Shows which roles can access which routes
 * 
 * Usage:
 *   const matrix = generatePermissionMatrix()
 *   // Returns: Map of routes to allowed roles
 */
export function generatePermissionMatrix(): Record<string, string[]> {
  const matrix: Record<string, string[]> = {}
  for (const [route, roles] of Object.entries(ROLE_REQUIREMENTS)) {
    matrix[route] = roles
  }
  return matrix
}
