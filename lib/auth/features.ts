/**
 * Feature Flag System - Fine-Grained Permission Control
 * 
 * Implements feature flags on top of role-based access control.
 * Features can be toggled per role, allowing for:
 * - A/B testing features with specific roles
 * - Gradual feature rollout
 * - Overriding role defaults
 * - Emergency feature disable
 * 
 * Architecture:
 * Role → Base Permissions (PERMISSIONS in roles.ts)
 *    ↓
 * Feature Flags → Override/Extend Permissions
 *    ↓
 * Final Permission Set
 * 
 * Server-Side Only: Feature flags are checked server-side only,
 * never sent to client. If you need client-side feature flags,
 * fetch from protected API endpoint.
 * 
 * Usage:
 *   import { isFeatureEnabled, hasFeatureAccess } from '@/lib/auth/features'
 *   
 *   if (hasFeatureAccess(userRole, 'CREATE_COURSE')) {
 *     // Show create course button
 *   }
 */

import type { RoleType } from './roles'
import { ROLES } from './roles'
import { logFeatureDenied } from '@/lib/auth/audit-logs'

/**
 * Feature Flag Constants
 * Define all features that can be toggled per role
 * 
 * Naming Convention: VERB_NOUN (e.g., CREATE_COURSE, DELETE_USER)
 * Format: Uppercase with underscores
 */
export const FEATURE_FLAGS = {
  // Course Management
  CREATE_COURSE: 'CREATE_COURSE' as const,
  EDIT_OWN_COURSE: 'EDIT_OWN_COURSE' as const,
  DELETE_OWN_COURSE: 'DELETE_OWN_COURSE' as const,
  PUBLISH_COURSE: 'PUBLISH_COURSE' as const,
  VIEW_COURSE_ANALYTICS: 'VIEW_COURSE_ANALYTICS' as const,
  
  // Product Management
  CREATE_PRODUCT: 'CREATE_PRODUCT' as const,
  EDIT_OWN_PRODUCT: 'EDIT_OWN_PRODUCT' as const,
  DELETE_OWN_PRODUCT: 'DELETE_OWN_PRODUCT' as const,
  MANAGE_INVENTORY: 'MANAGE_INVENTORY' as const,
  
  // User Management
  MANAGE_USERS: 'MANAGE_USERS' as const,
  VIEW_USER_DETAILS: 'VIEW_USER_DETAILS' as const,
  DELETE_USER: 'DELETE_USER' as const,
  BULK_IMPORT_USERS: 'BULK_IMPORT_USERS' as const,
  
  // Blog/Content
  CREATE_BLOG: 'CREATE_BLOG' as const,
  EDIT_OWN_BLOG: 'EDIT_OWN_BLOG' as const,
  PUBLISH_BLOG: 'PUBLISH_BLOG' as const,
  
  // Learning Features
  ENROLL_COURSE: 'ENROLL_COURSE' as const,
  VIEW_COURSE: 'VIEW_COURSE' as const,
  COMPLETE_LESSON: 'COMPLETE_LESSON' as const,
  DOWNLOAD_RESOURCES: 'DOWNLOAD_RESOURCES' as const,
  
  // Shopping Features
  BROWSE_PRODUCTS: 'BROWSE_PRODUCTS' as const,
  PURCHASE_PRODUCT: 'PURCHASE_PRODUCT' as const,
  VIEW_ORDER_HISTORY: 'VIEW_ORDER_HISTORY' as const,
  TRACK_SHIPMENT: 'TRACK_SHIPMENT' as const,
  
  // Premium Features
  EARLY_ACCESS_FEATURES: 'EARLY_ACCESS_FEATURES' as const,
  BETA_TESTING: 'BETA_TESTING' as const,
  ADVANCED_ANALYTICS: 'ADVANCED_ANALYTICS' as const,
  
  // System Features
  VIEW_SYSTEM_LOGS: 'VIEW_SYSTEM_LOGS' as const,
  MANAGE_SETTINGS: 'MANAGE_SETTINGS' as const,
  VIEW_AUDIT_TRAIL: 'VIEW_AUDIT_TRAIL' as const,
} as const

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS]

/**
 * Feature Flag Configuration Per Role
 * 
 * Maps each role to their enabled features.
 * If a feature is not in the list for a role, it's disabled.
 * 
 * Format:
 *   [ROLES.ROLE_NAME]: [FEATURE_FLAGS.FEATURE_1, FEATURE_FLAGS.FEATURE_2]
 * 
 * Update this to:
 * - Enable new features for a role
 * - Disable features for a role
 * - A/B test features with specific roles
 * - Gradually roll out features
 */
export const FEATURE_PERMISSIONS: Record<RoleType, FeatureFlag[]> = {
  [ROLES.ADMIN]: [
    // Admin has all features enabled
    FEATURE_FLAGS.CREATE_COURSE,
    FEATURE_FLAGS.EDIT_OWN_COURSE,
    FEATURE_FLAGS.DELETE_OWN_COURSE,
    FEATURE_FLAGS.PUBLISH_COURSE,
    FEATURE_FLAGS.VIEW_COURSE_ANALYTICS,
    FEATURE_FLAGS.CREATE_PRODUCT,
    FEATURE_FLAGS.EDIT_OWN_PRODUCT,
    FEATURE_FLAGS.DELETE_OWN_PRODUCT,
    FEATURE_FLAGS.MANAGE_INVENTORY,
    FEATURE_FLAGS.MANAGE_USERS,
    FEATURE_FLAGS.VIEW_USER_DETAILS,
    FEATURE_FLAGS.DELETE_USER,
    FEATURE_FLAGS.BULK_IMPORT_USERS,
    FEATURE_FLAGS.CREATE_BLOG,
    FEATURE_FLAGS.EDIT_OWN_BLOG,
    FEATURE_FLAGS.PUBLISH_BLOG,
    FEATURE_FLAGS.ENROLL_COURSE,
    FEATURE_FLAGS.VIEW_COURSE,
    FEATURE_FLAGS.COMPLETE_LESSON,
    FEATURE_FLAGS.DOWNLOAD_RESOURCES,
    FEATURE_FLAGS.BROWSE_PRODUCTS,
    FEATURE_FLAGS.PURCHASE_PRODUCT,
    FEATURE_FLAGS.VIEW_ORDER_HISTORY,
    FEATURE_FLAGS.TRACK_SHIPMENT,
    FEATURE_FLAGS.EARLY_ACCESS_FEATURES,
    FEATURE_FLAGS.BETA_TESTING,
    FEATURE_FLAGS.ADVANCED_ANALYTICS,
    FEATURE_FLAGS.VIEW_SYSTEM_LOGS,
    FEATURE_FLAGS.MANAGE_SETTINGS,
    FEATURE_FLAGS.VIEW_AUDIT_TRAIL,
  ],

  [ROLES.WRITER]: [
    // Content creators
    FEATURE_FLAGS.CREATE_COURSE,
    FEATURE_FLAGS.EDIT_OWN_COURSE,
    FEATURE_FLAGS.DELETE_OWN_COURSE,
    FEATURE_FLAGS.PUBLISH_COURSE,
    FEATURE_FLAGS.VIEW_COURSE_ANALYTICS,
    FEATURE_FLAGS.CREATE_PRODUCT,
    FEATURE_FLAGS.EDIT_OWN_PRODUCT,
    FEATURE_FLAGS.DELETE_OWN_PRODUCT,
    FEATURE_FLAGS.CREATE_BLOG,
    FEATURE_FLAGS.EDIT_OWN_BLOG,
    FEATURE_FLAGS.PUBLISH_BLOG,
    FEATURE_FLAGS.VIEW_COURSE,
    FEATURE_FLAGS.DOWNLOAD_RESOURCES,
    FEATURE_FLAGS.ADVANCED_ANALYTICS,
    FEATURE_FLAGS.EARLY_ACCESS_FEATURES,
  ],

  [ROLES.LEARNER]: [
    // Students
    FEATURE_FLAGS.ENROLL_COURSE,
    FEATURE_FLAGS.VIEW_COURSE,
    FEATURE_FLAGS.COMPLETE_LESSON,
    FEATURE_FLAGS.DOWNLOAD_RESOURCES,
    FEATURE_FLAGS.BROWSE_PRODUCTS,
    FEATURE_FLAGS.PURCHASE_PRODUCT,
    FEATURE_FLAGS.VIEW_ORDER_HISTORY,
    FEATURE_FLAGS.TRACK_SHIPMENT,
    FEATURE_FLAGS.BETA_TESTING,
  ],

  [ROLES.CUSTOMER]: [
    // Shoppers
    FEATURE_FLAGS.BROWSE_PRODUCTS,
    FEATURE_FLAGS.PURCHASE_PRODUCT,
    FEATURE_FLAGS.VIEW_ORDER_HISTORY,
    FEATURE_FLAGS.TRACK_SHIPMENT,
    FEATURE_FLAGS.DOWNLOAD_RESOURCES,
  ],
}

/**
 * Feature Flag Descriptions
 * Human-readable descriptions for each feature
 * Useful for documentation and admin panels
 */
export const FEATURE_DESCRIPTIONS: Record<FeatureFlag, string> = {
  [FEATURE_FLAGS.CREATE_COURSE]: 'Create new courses',
  [FEATURE_FLAGS.EDIT_OWN_COURSE]: 'Edit own courses',
  [FEATURE_FLAGS.DELETE_OWN_COURSE]: 'Delete own courses',
  [FEATURE_FLAGS.PUBLISH_COURSE]: 'Publish courses',
  [FEATURE_FLAGS.VIEW_COURSE_ANALYTICS]: 'View course analytics',
  [FEATURE_FLAGS.CREATE_PRODUCT]: 'Create new products',
  [FEATURE_FLAGS.EDIT_OWN_PRODUCT]: 'Edit own products',
  [FEATURE_FLAGS.DELETE_OWN_PRODUCT]: 'Delete own products',
  [FEATURE_FLAGS.MANAGE_INVENTORY]: 'Manage product inventory',
  [FEATURE_FLAGS.MANAGE_USERS]: 'Manage all users',
  [FEATURE_FLAGS.VIEW_USER_DETAILS]: 'View user details',
  [FEATURE_FLAGS.DELETE_USER]: 'Delete users',
  [FEATURE_FLAGS.BULK_IMPORT_USERS]: 'Bulk import users',
  [FEATURE_FLAGS.CREATE_BLOG]: 'Create blog posts',
  [FEATURE_FLAGS.EDIT_OWN_BLOG]: 'Edit own blog posts',
  [FEATURE_FLAGS.PUBLISH_BLOG]: 'Publish blog posts',
  [FEATURE_FLAGS.ENROLL_COURSE]: 'Enroll in courses',
  [FEATURE_FLAGS.VIEW_COURSE]: 'View courses',
  [FEATURE_FLAGS.COMPLETE_LESSON]: 'Complete lessons',
  [FEATURE_FLAGS.DOWNLOAD_RESOURCES]: 'Download learning resources',
  [FEATURE_FLAGS.BROWSE_PRODUCTS]: 'Browse product catalog',
  [FEATURE_FLAGS.PURCHASE_PRODUCT]: 'Purchase products',
  [FEATURE_FLAGS.VIEW_ORDER_HISTORY]: 'View order history',
  [FEATURE_FLAGS.TRACK_SHIPMENT]: 'Track shipments',
  [FEATURE_FLAGS.EARLY_ACCESS_FEATURES]: 'Early access to new features',
  [FEATURE_FLAGS.BETA_TESTING]: 'Participate in beta testing',
  [FEATURE_FLAGS.ADVANCED_ANALYTICS]: 'Access advanced analytics',
  [FEATURE_FLAGS.VIEW_SYSTEM_LOGS]: 'View system logs',
  [FEATURE_FLAGS.MANAGE_SETTINGS]: 'Manage system settings',
  [FEATURE_FLAGS.VIEW_AUDIT_TRAIL]: 'View audit trail',
}

/**
 * Check if a role has access to a specific feature flag
 * 
 * Server-side only: This function should only be called on the server.
 * Never expose feature flag status to client-side code directly.
 * 
 * Usage:
 *   if (hasFeatureAccess(userRole, FEATURE_FLAGS.CREATE_COURSE)) {
 *     await createCourse(data)
 *   } else {
 *     throw new Error('Feature not available for your role')
 *   }
 */
export function hasFeatureAccess(
  role: RoleType,
  feature: FeatureFlag
): boolean {
  const features = FEATURE_PERMISSIONS[role]
  if (!features) {
    return false
  }
  return features.includes(feature)
}

/**
 * Get all features enabled for a role
 * 
 * Usage:
 *   const features = getEnabledFeatures(ROLES.WRITER)
 *   console.log(features) // Array of feature flags
 */
export function getEnabledFeatures(role: RoleType): FeatureFlag[] {
  return FEATURE_PERMISSIONS[role] ?? []
}

/**
 * Get feature description
 * 
 * Usage:
 *   const desc = getFeatureDescription(FEATURE_FLAGS.CREATE_COURSE)
 *   // Returns: "Create new courses"
 */
export function getFeatureDescription(feature: FeatureFlag): string {
  return FEATURE_DESCRIPTIONS[feature] ?? 'Unknown feature'
}

/**
 * Check if a feature is enabled for a role (with optional override)
 * 
 * This function allows for dynamic feature flag overrides.
 * Useful for feature flags stored in database or environment variables.
 * 
 * Usage:
 *   const isEnabled = isFeatureEnabled(
 *     ROLES.LEARNER,
 *     FEATURE_FLAGS.CREATE_COURSE,
 *     { override: false } // Always disable, override config
 *   )
 */
export function isFeatureEnabled(
  role: RoleType,
  feature: FeatureFlag,
  options?: { override?: boolean }
): boolean {
  // If explicit override provided, use it
  if (options?.override !== undefined) {
    return options.override
  }

  // Otherwise check feature permissions
  return hasFeatureAccess(role, feature)
}

/**
 * Require a feature to be enabled for a role
 * Throws an error if feature is not available
 * 
 * Usage in server actions:
 *   'use server'
 *   export async function createCourse(data: CourseData) {
 *     const session = await checkRole(ROLES.WRITER)
 *     requireFeature(session.user.role, FEATURE_FLAGS.CREATE_COURSE)
 *     // Safe to create course now
 *   }
 * 
 * Usage in API routes:
 *   export async function POST(request: NextRequest) {
 *     const session = await requireRole(ROLES.WRITER)
 *     const userRole = (session.user as any).role
 *     requireFeature(userRole, FEATURE_FLAGS.CREATE_COURSE)
 *     // Process request
 *   }
 */
export function requireFeature(
  role: RoleType,
  feature: FeatureFlag,
  options?: {
    message?: string
    userId?: string
    route?: string
  }
): void {
  if (!hasFeatureAccess(role, feature)) {
    const message =
      options?.message ?? 
      `Feature not available: ${feature} is not enabled for role ${role}`
    
    // Log feature denial (non-blocking)
    if (options?.userId) {
      logFeatureDenied({
        userId: options.userId,
        userRole: role,
        route: options?.route || 'server-action',
        reason: message,
        feature: feature,
      }).catch(err => console.error('Failed to log feature denial:', err))
    }
    
    throw new Error(message)
  }
}

/**
 * Get feature flag matrix for a role
 * Shows all available features with their descriptions
 * 
 * Usage:
 *   const matrix = getFeatureMatrix(ROLES.WRITER)
 */
export function getFeatureMatrix(role: RoleType): Record<FeatureFlag, string> {
  const enabled = getEnabledFeatures(role)
  const matrix: Record<string, string> = {}
  
  for (const feature of enabled) {
    matrix[feature] = getFeatureDescription(feature)
  }
  
  return matrix as Record<FeatureFlag, string>
}

/**
 * Get all features with their availability per role
 * Useful for generating permission matrix documentation
 * 
 * Usage:
 *   const allFeatures = getAllFeatures()
 *   console.log(allFeatures)
 *   // {
 *   //   'CREATE_COURSE': {
 *   //     'ADMIN': true,
 *   //     'WRITER': true,
 *   //     'LEARNER': false,
 *   //     'CUSTOMER': false
 *   //   },
 *   //   ...
 *   // }
 */
export function getAllFeatures(): Record<
  FeatureFlag,
  Record<RoleType, boolean>
> {
  const result: Record<string, Record<RoleType, boolean>> = {}
  
  const roles = [ROLES.ADMIN, ROLES.WRITER, ROLES.LEARNER, ROLES.CUSTOMER]
  const allFlags = Object.values(FEATURE_FLAGS)
  
  for (const flag of allFlags) {
    result[flag] = {} as Record<RoleType, boolean>
    for (const role of roles) {
      result[flag][role] = hasFeatureAccess(role, flag)
    }
  }
  
  return result as Record<FeatureFlag, Record<RoleType, boolean>>
}

/**
 * Check if any feature is enabled for a role
 * Useful for conditional UI (show dashboard if user has any features)
 * 
 * Usage:
 *   if (hasAnyFeature(userRole)) {
 *     return <Dashboard />
 *   }
 */
export function hasAnyFeature(role: RoleType): boolean {
  return getEnabledFeatures(role).length > 0
}

/**
 * Check if a role has ALL of the specified features
 * Useful for gatekeeping complex workflows
 * 
 * Usage:
 *   if (hasAllFeatures(userRole, [
 *     FEATURE_FLAGS.CREATE_COURSE,
 *     FEATURE_FLAGS.PUBLISH_COURSE
 *   ])) {
 *     // User can create and publish
 *   }
 */
export function hasAllFeatures(
  role: RoleType,
  features: FeatureFlag[]
): boolean {
  return features.every(feature => hasFeatureAccess(role, feature))
}

/**
 * Check if a role has ANY of the specified features
 * 
 * Usage:
 *   if (hasAnyOfFeatures(userRole, [
 *     FEATURE_FLAGS.CREATE_COURSE,
 *     FEATURE_FLAGS.CREATE_PRODUCT
 *   ])) {
 *     // User can create something
 *   }
 */
export function hasAnyOfFeatures(
  role: RoleType,
  features: FeatureFlag[]
): boolean {
  return features.some(feature => hasFeatureAccess(role, feature))
}
