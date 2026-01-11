# Feature Flags System

## Overview

The feature flag system provides fine-grained permission control on top of role-based access control. Features can be toggled per role, allowing for A/B testing, gradual rollout, and emergency feature disabling.

## Architecture

```
Role-Based Access Control (RBAC)
        ↓
Feature Flags (Per-Role Toggle)
        ↓
Final Permission Set
```

## Feature Flag Constants

Located in `lib/auth/features.ts`, includes 30+ features:

### Course Management
- `CREATE_COURSE` - Create new courses
- `EDIT_OWN_COURSE` - Edit own courses
- `DELETE_OWN_COURSE` - Delete own courses
- `PUBLISH_COURSE` - Publish courses
- `VIEW_COURSE_ANALYTICS` - View analytics

### Product Management
- `CREATE_PRODUCT` - Create products
- `EDIT_OWN_PRODUCT` - Edit own products
- `DELETE_OWN_PRODUCT` - Delete own products
- `MANAGE_INVENTORY` - Manage inventory

### User Management
- `MANAGE_USERS` - Manage all users
- `VIEW_USER_DETAILS` - View user details
- `DELETE_USER` - Delete users
- `BULK_IMPORT_USERS` - Bulk import users

### Learning & Shopping
- `ENROLL_COURSE` - Enroll in courses
- `BROWSE_PRODUCTS` - Browse products
- `PURCHASE_PRODUCT` - Purchase products

### Premium Features
- `EARLY_ACCESS_FEATURES` - Early access to new features
- `BETA_TESTING` - Participate in beta
- `ADVANCED_ANALYTICS` - Advanced analytics

### System Features
- `VIEW_SYSTEM_LOGS` - View logs
- `MANAGE_SETTINGS` - Manage settings
- `VIEW_AUDIT_TRAIL` - View audit trail

## Usage Examples

### Check Feature Access (Server-Side)

```typescript
import { hasFeatureAccess, FEATURE_FLAGS } from '@/lib/auth/features'
import type { RoleType } from '@/lib/auth/roles'

// In a server component or action
if (hasFeatureAccess(userRole, FEATURE_FLAGS.CREATE_COURSE)) {
  // Show create course button
}
```

### Require Feature (Throw on Unavailable)

```typescript
import { requireFeature, FEATURE_FLAGS } from '@/lib/auth/features'
import { checkRole, ROLES } from '@/lib/auth/server-role'

// In a server action
'use server'
export async function createCourse(data: CourseData) {
  const session = await checkRole(ROLES.WRITER)
  const userRole = (session.user as any).role
  
  // Throws error if feature not available
  requireFeature(userRole, FEATURE_FLAGS.CREATE_COURSE)
  
  // Safe to create course now
  await prisma.course.create({ data })
}
```

### In API Routes

```typescript
import { requireFeature, FEATURE_FLAGS } from '@/lib/auth/features'
import { requireRole } from '@/lib/auth/role'

export async function POST(request: NextRequest) {
  const session = await requireRole(ROLES.WRITER)
  const userRole = (session.user as any).role
  
  requireFeature(userRole, FEATURE_FLAGS.CREATE_COURSE)
  
  const data = await request.json()
  // Process request
}
```

### Conditional UI

```typescript
import { hasFeatureAccess, FEATURE_FLAGS } from '@/lib/auth/features'

export function CourseActions({ userRole }: { userRole: RoleType }) {
  return (
    <div>
      {hasFeatureAccess(userRole, FEATURE_FLAGS.CREATE_COURSE) && (
        <button>Create Course</button>
      )}
      
      {hasFeatureAccess(userRole, FEATURE_FLAGS.VIEW_COURSE_ANALYTICS) && (
        <button>View Analytics</button>
      )}
    </div>
  )
}
```

### Get All Features for a Role

```typescript
import { getEnabledFeatures, getFeatureDescription } from '@/lib/auth/features'

const features = getEnabledFeatures(ROLES.WRITER)
const descriptions = features.map(feature => ({
  feature,
  description: getFeatureDescription(feature)
}))

console.log(descriptions)
// [
//   { feature: 'CREATE_COURSE', description: 'Create new courses' },
//   { feature: 'EDIT_OWN_COURSE', description: 'Edit own courses' },
//   ...
// ]
```

### Check Multiple Features

```typescript
import { hasAllFeatures, hasAnyOfFeatures, FEATURE_FLAGS } from '@/lib/auth/features'

// Check if user has ALL of these features
if (hasAllFeatures(userRole, [
  FEATURE_FLAGS.CREATE_COURSE,
  FEATURE_FLAGS.PUBLISH_COURSE
])) {
  // User can create and publish
}

// Check if user has ANY of these features
if (hasAnyOfFeatures(userRole, [
  FEATURE_FLAGS.CREATE_COURSE,
  FEATURE_FLAGS.CREATE_PRODUCT
])) {
  // User can create something
}
```

### Generate Permission Matrix

```typescript
import { getAllFeatures } from '@/lib/auth/features'

const matrix = getAllFeatures()
console.log(matrix)
// {
//   'CREATE_COURSE': {
//     'ADMIN': true,
//     'WRITER': true,
//     'LEARNER': false,
//     'CUSTOMER': false
//   },
//   'BROWSE_PRODUCTS': {
//     'ADMIN': true,
//     'WRITER': false,
//     'LEARNER': true,
//     'CUSTOMER': true
//   },
//   ...
// }
```

## Adding New Features

### 1. Add Feature Constant

```typescript
export const FEATURE_FLAGS = {
  // ... existing features
  MY_NEW_FEATURE: 'MY_NEW_FEATURE' as const,
}
```

### 2. Add Feature Description

```typescript
export const FEATURE_DESCRIPTIONS: Record<FeatureFlag, string> = {
  // ... existing descriptions
  [FEATURE_FLAGS.MY_NEW_FEATURE]: 'Description of what this feature does',
}
```

### 3. Add to Role Permissions

```typescript
export const FEATURE_PERMISSIONS: Record<RoleType, FeatureFlag[]> = {
  [ROLES.ADMIN]: [
    // ... existing features
    FEATURE_FLAGS.MY_NEW_FEATURE,
  ],
  [ROLES.WRITER]: [
    // ... existing features
    // FEATURE_FLAGS.MY_NEW_FEATURE, // If writers should have it
  ],
  // ...
}
```

### 4. Use in Code

```typescript
import { requireFeature, FEATURE_FLAGS } from '@/lib/auth/features'

requireFeature(userRole, FEATURE_FLAGS.MY_NEW_FEATURE)
```

## Feature Flag Strategies

### A/B Testing
Enable a feature for only ADMIN role first, test, then roll out to WRITER:

```typescript
export const FEATURE_PERMISSIONS = {
  [ROLES.ADMIN]: [FEATURE_FLAGS.NEW_UI_DESIGN], // Only admins see it
  [ROLES.WRITER]: [], // Not enabled yet
  [ROLES.LEARNER]: [],
  [ROLES.CUSTOMER]: [],
}

// After testing, enable for writers:
export const FEATURE_PERMISSIONS = {
  [ROLES.ADMIN]: [FEATURE_FLAGS.NEW_UI_DESIGN],
  [ROLES.WRITER]: [FEATURE_FLAGS.NEW_UI_DESIGN], // Now writers too
  // ...
}
```

### Gradual Rollout
Enable a new feature one role at a time:

```typescript
// Week 1: Admins only
[ROLES.ADMIN]: [FEATURE_FLAGS.ADVANCED_EXPORT],

// Week 2: Add writers
[ROLES.WRITER]: [FEATURE_FLAGS.ADVANCED_EXPORT],

// Week 3: Add learners
[ROLES.LEARNER]: [FEATURE_FLAGS.ADVANCED_EXPORT],

// Week 4: Add customers
[ROLES.CUSTOMER]: [FEATURE_FLAGS.ADVANCED_EXPORT],
```

### Emergency Disable
If a feature causes issues, quickly disable it:

```typescript
// Comment out from all roles
// [ROLES.ADMIN]: [FEATURE_FLAGS.PROBLEMATIC_FEATURE],
// All other references...

// Feature is now disabled everywhere
```

### Beta Testing
Let specific roles test new features:

```typescript
[ROLES.ADMIN]: [
  FEATURE_FLAGS.BETA_FEATURE_X,
  FEATURE_FLAGS.BETA_TESTING, // Mark as beta tester
],
[ROLES.LEARNER]: [
  // Only if they opt-in (via database, not here)
],
```

## Important Notes

### Server-Side Only
Feature flags must be checked server-side only. Never expose feature status to client-side code directly.

✅ **Correct** (Server-Side):
```typescript
// In server component, server action, or API route
if (hasFeatureAccess(userRole, FEATURE_FLAGS.CREATE_COURSE)) {
  // Safe to check
}
```

❌ **Wrong** (Client-Side):
```typescript
// Do NOT do this - exposes feature flags to client
const data = { features: getEnabledFeatures(userRole) }
return json(data) // Now client can see which features are enabled
```

### Defense-in-Depth
Always combine role checks with feature checks:

```typescript
// Good: Double check
await requireRole(ROLES.WRITER)
requireFeature(userRole, FEATURE_FLAGS.CREATE_COURSE)

// Better: Let each layer handle it
export async function createCourse(data: CourseData) {
  // Server component uses requireServerRole
  await requireServerRole([ROLES.WRITER, ROLES.ADMIN])
  
  // Then server action uses requireFeature
  requireFeature(userRole, FEATURE_FLAGS.CREATE_COURSE)
}
```

## Integration with Other Systems

### With `lib/auth/roles.ts`
Feature flags extend role-based permissions:

```
ROLES define broad access (e.g., WRITER role)
    ↓
FEATURE_FLAGS refine access (e.g., only CREATE_COURSE, not DELETE_COURSE)
    ↓
Fine-grained access control
```

### With `middleware.ts`
Middleware checks authentication only, not features:

```typescript
// middleware.ts: Is user authenticated?
if (!token) redirect('/login')

// Page component: Does user have feature?
requireFeature(userRole, FEATURE_FLAGS.CREATE_COURSE)
```

## Testing Feature Flags

```typescript
import { hasFeatureAccess, FEATURE_FLAGS, ROLES } from '@/lib/auth/features'

describe('Feature Flags', () => {
  it('ADMIN has CREATE_COURSE', () => {
    expect(hasFeatureAccess(ROLES.ADMIN, FEATURE_FLAGS.CREATE_COURSE)).toBe(true)
  })

  it('CUSTOMER does not have CREATE_COURSE', () => {
    expect(hasFeatureAccess(ROLES.CUSTOMER, FEATURE_FLAGS.CREATE_COURSE)).toBe(false)
  })

  it('WRITER can view analytics', () => {
    expect(hasFeatureAccess(ROLES.WRITER, FEATURE_FLAGS.VIEW_COURSE_ANALYTICS)).toBe(true)
  })
})
```

## Common Patterns

### Gate Complex Workflows
```typescript
export async function publishCourse(courseId: string) {
  const session = await requireServerRole([ROLES.WRITER, ROLES.ADMIN])
  const userRole = (session.user as any).role
  
  // Require both features
  requireFeature(userRole, FEATURE_FLAGS.CREATE_COURSE)
  requireFeature(userRole, FEATURE_FLAGS.PUBLISH_COURSE)
  
  // Safe to publish
  await updateCourse(courseId, { status: 'PUBLISHED' })
}
```

### Premium Features
```typescript
if (hasFeatureAccess(userRole, FEATURE_FLAGS.ADVANCED_ANALYTICS)) {
  // Show premium analytics dashboard
} else {
  // Show limited free version
}
```

### Soft Launches
```typescript
if (hasFeatureAccess(userRole, FEATURE_FLAGS.BETA_TESTING)) {
  // Show beta features
  return <BetaFeatures />
}

// Show stable features
return <StableFeatures />
```
