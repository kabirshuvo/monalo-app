# Audit Logging for Access Control

Complete guide to the server-side audit logging system for tracking access attempts (both allowed and denied).

## Overview fixed error

The audit logging system provides comprehensive visibility into access control events:
- **What**: Who tried to access what
- **When**: Timestamp of the attempt
- **Result**: Allowed or denied
- **Why**: Reason for the decision (insufficient role, feature disabled, etc.)

All logs are:
- ✅ **Server-side only** — Never triggered from middleware or client code
- ✅ **Non-blocking** — Logged asynchronously without waiting
- ✅ **Failure-safe** — Logging failures never break the application
- ✅ **Audit-trail ready** — Includes createdBy, timestamp, deletedAt for compliance

## Security Architecture Rules

⚠️ **Critical security principles that govern this system:**

1. **Middleware = Authentication Only**
   - Middleware checks if token is valid (not expired, properly signed)
   - Middleware does NOT check role claims from JWT
   - Middleware does NOT perform authorization decisions
   - No logging from middleware

2. **Server Guards = Authorization + Logging**
   - Server-side guards (requireRole, requireServerRole, checkRole, requireFeature) perform actual authorization
   - All authorization decisions logged server-side
   - Role always re-validated from session/database, never from JWT claims alone

3. **Never Trust JWT Role Claims**
   - JWT claims can be forged or manipulated by user
   - Always validate role from authenticated session (server-side)
   - Always validate against source-of-truth database
   - JWTs used only for authentication, not authorization

4. **Always Log Denied Access**
   - Every authorization failure logged automatically
   - Logs include userId, role, route, reason, timestamp
   - Logs enable security auditing and attack detection
   - Logs are non-blocking and failure-safe

## Architecture

```
Access Control Layer (lib/auth/*.ts)
    ↓
[Authorization Check: PASS/FAIL]
    ↓
On FAIL: logAccessDenied() → Async write to ActivityLog
    ↓
ActivityLog record created with:
  - userId: Who tried to access
  - userRole: Their role at time of attempt
  - route: What they tried to access
  - reason: Why denied
  - timestamp: When it happened
  - action: DENIED_ACCESS (or related)
```

## What Gets Logged

### Access Denial Events

Every access denial is automatically logged:

```typescript
// In lib/auth/server-role.ts (requireServerRole, checkRole)
logAccessDenied({
  userId: 'user-123',
  userRole: 'LEARNER',
  route: '/dashboard/admin',
  reason: 'Insufficient role: LEARNER is not in [ADMIN]',
})

// In lib/auth/role.ts (requireRole)
logAccessDenied({
  userId: 'user-456',
  userRole: 'WRITER',
  route: 'api',
  reason: 'Insufficient role: WRITER is not in [ADMIN]',
})

// In lib/auth/features.ts (requireFeature)
logFeatureDenied({
  userId: 'user-789',
  userRole: 'LEARNER',
  route: 'server-action',
  reason: 'Feature not available: CREATE_COURSE is not enabled for LEARNER',
  feature: 'CREATE_COURSE',
})
```

### Authentication Failure Events

```typescript
// In lib/auth/server-role.ts (requireServerRole, checkRole)
logAuthFailure({
  userId: 'ANONYMOUS',
  route: '/dashboard',
  reason: 'No active session',
})
```

### Logged Fields

| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `userId` | string | "user-123" | Who attempted access |
| `userRole` | string \| null | "LEARNER" | Their role at time of attempt |
| `route` | string | "/dashboard/admin" | Resource attempted |
| `reason` | string | "Insufficient role" | Why denied |
| `action` | string | "DENIED_ACCESS" | Type of event |
| `timestamp` | Date | 2024-01-15T10:30:00Z | When it happened |
| `createdBy` | string | "user-123" | Audit field: who triggered log |
| `deletedAt` | Date \| null | null | Soft delete support |

## Integration Points

### 1. Server Components (lib/auth/server-role.ts)

```typescript
// Pages that require specific roles automatically log denials
// Example: app/dashboard/admin/page.tsx

import { requireServerRole } from '@/lib/auth/server-role'

export default async function AdminDashboard() {
  // Automatically logs access denial if not ADMIN
  await requireServerRole('ADMIN')
  
  return <AdminContent />
}
```

**What gets logged:**
- ✅ No session → AUTH_FAILURE
- ✅ User lacks role → DENIED_ACCESS
- ✅ Role validation fails → DENIED_ACCESS

### 2. Server Actions (lib/auth/server-role.ts)

```typescript
// 'use server'
import { checkRole } from '@/lib/auth/server-role'

export async function updateUserRole(userId: string, newRole: string) {
  // Throws error and logs if unauthorized
  const session = await checkRole('ADMIN')
  
  // Process request with guaranteed ADMIN role
  // ...
}
```

**What gets logged:**
- ✅ Authentication failures
- ✅ Insufficient role attempts

### 3. API Routes (lib/auth/role.ts)

```typescript
// app/api/courses/route.ts
import { requireRole } from '@/lib/auth/role'

export async function POST(request: NextRequest) {
  // Automatically logs access denial if not ADMIN or WRITER
  const session = await requireRole(['ADMIN', 'WRITER'])
  
  // Process request
  // ...
}
```

**What gets logged:**
- ✅ Missing authentication (401)
- ✅ Insufficient role (403)

### 4. Feature Flags (lib/auth/features.ts)

```typescript
// app/api/courses/route.ts
import { requireFeature } from '@/lib/auth/features'
import { getServerUserId } from '@/lib/auth/server-role'

export async function POST(request: NextRequest) {
  const session = await requireRole('WRITER')
  const userId = (session.user as any).id
  const userRole = (session.user as any).role
  
  // Requires feature to be enabled for role
  // Logs denial if feature disabled
  requireFeature(userRole, 'CREATE_COURSE', {
    userId,
    route: '/api/courses',
  })
  
  // Process request
  // ...
}
```

**What gets logged:**
- ✅ Feature not enabled for role
- ✅ Feature disabled via config

## Usage Examples

### Example 1: Protect Admin Dashboard

```typescript
// app/dashboard/admin/page.tsx
import { requireServerRole } from '@/lib/auth/server-role'

export default async function AdminDashboard() {
  // Automatically logs:
  // - AUTH_FAILURE if no session
  // - DENIED_ACCESS if not ADMIN
  await requireServerRole('ADMIN')
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  )
}
```

### Example 2: Protect API Route with Multiple Roles

```typescript
// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/role'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Logs DENIED_ACCESS if user not ADMIN or WRITER
    const session = await requireRole(['ADMIN', 'WRITER'])
    
    const userId = (session.user as any).id
    const data = await request.json()
    
    // Create course
    const course = await prisma.course.create({
      data: {
        title: data.title,
        createdBy: userId,
      },
    })
    
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Example 3: Server Action with Role Check

```typescript
// app/actions/course.ts
'use server'

import { checkRole } from '@/lib/auth/server-role'
import { requireFeature } from '@/lib/auth/features'
import { prisma } from '@/lib/db'

export async function createCourse(data: any) {
  // Throws and logs if:
  // - No session (AUTH_FAILURE)
  // - Not ADMIN or WRITER (DENIED_ACCESS)
  const session = await checkRole(['ADMIN', 'WRITER'])
  
  const userId = (session.user as any).id
  const userRole = (session.user as any).role
  
  // Check feature flag (logs if disabled)
  requireFeature(userRole, 'CREATE_COURSE', {
    userId,
    route: '/dashboard/courses',
  })
  
  // Safe to create course
  return await prisma.course.create({
    data: {
      title: data.title,
      createdBy: userId,
    },
  })
}
```

## Querying Audit Logs

### Get All Denials for a User

```typescript
import { getAccessDenialLogs } from '@/lib/auth/audit-logs'

// Get last 30 days of denials
const logs = await getAccessDenialLogs('user-123', { days: 30 })

// Get specific action in last 7 days
const authFailures = await getAccessDenialLogs('user-123', {
  days: 7,
  action: 'AUTH_FAILURE',
})

// Limit results
const recentDenials = await getAccessDenialLogs('user-123', {
  limit: 50,
})
```

### Get Denials by Role

```typescript
import { getAccessDenialsByRole } from '@/lib/auth/audit-logs'

// Find all LEARNER access denials (last 30 days)
const learnerDenials = await getAccessDenialsByRole('LEARNER', { days: 30 })

// Identify problematic routes for role
const routes = learnerDenials.map(log => log.route)
```

### Get Denials by Route

```typescript
import { getAccessDenialsByRoute } from '@/lib/auth/audit-logs'

// Find who's trying to access admin panel
const adminPanelDenials = await getAccessDenialsByRoute('/dashboard/admin', {
  days: 7,
})

// Suspicious access pattern?
console.log(`${adminPanelDenials.length} attempted accesses to admin panel`)
```

### Get Summary (Dashboard)

```typescript
import { getAccessDenialSummary } from '@/lib/auth/audit-logs'

// Get denial metrics for last 30 days
const summary = await getAccessDenialSummary({ days: 30 })

console.log(`Total denials: ${summary.totalDenials}`)
console.log('By role:', summary.denialsByRole)
console.log('Top denied routes:', summary.topDeniedRoutes)
console.log('Top denied roles:', summary.topDeniedRoles)

// Output:
// Total denials: 156
// By role: { LEARNER: 120, WRITER: 36 }
// Top denied routes: [
//   { route: '/dashboard/admin', count: 98 },
//   { route: '/api/users', count: 45 },
//   { route: '/dashboard/settings', count: 13 }
// ]
// Top denied roles: [
//   { role: 'LEARNER', count: 120 },
//   { role: 'WRITER', count: 36 }
// ]
```

## Implementation Details

### Non-Blocking Pattern

Logging is intentionally **non-blocking**:

```typescript
// CORRECT: Fire and forget, don't wait
logAccessDenied({
  userId: 'user-123',
  userRole: 'LEARNER',
  route: '/dashboard/admin',
  reason: 'Insufficient role',
}).catch(err => console.error('Audit log error:', err))

// Continue processing immediately
throw new Error('Access denied')
```

**Never do this:**

```typescript
// WRONG: This blocks until log is written
await logAccessDenied({
  userId: 'user-123',
  // ...
})
throw new Error('Access denied') // Slow!
```

### Failure-Safe Design

Logging failures **never crash the application**:

```typescript
try {
  // Even if database is down, authorization still works
  logAccessDenied({ /* ... */ }).catch(err => {
    // Log error but don't throw
    console.error('[Audit] Failed to record denial:', err)
  })
} catch (error) {
  // Inner catch - should not happen with current implementation
  console.error('[Audit] Unexpected error:', error)
}

// Application continues regardless of logging success
throw new AuthorizationError(403, 'Access denied')
```

### Audit Field Integration

All logs include audit fields for compliance:

```typescript
// Every log entry automatically gets:
{
  id: 'cuid-generated', // Unique ID
  userId: 'user-123',    // Who created the log
  createdBy: 'user-123', // Audit field: log creator
  timestamp: new Date(), // When created
  deletedAt: null,       // Soft delete support
}
```

## Security Considerations

### 1. No Sensitive Data in Logs

❌ **Bad:**
```typescript
logAccessDenied({
  userId: user.id,
  userRole: user.role,
  route: '/api/users?password=' + password, // NEVER!
  reason: 'Access denied due to failed 2FA code: ' + code, // NEVER!
})
```

✅ **Good:**
```typescript
logAccessDenied({
  userId: user.id,
  userRole: user.role,
  route: '/api/users',
  reason: 'Insufficient role: LEARNER not in [ADMIN]',
})
```

### 2. Server-Side Only

❌ **Bad** (never do this):
```typescript
// Client-side: NEVER send audit logs from client
fetch('/api/audit-logs', {
  method: 'POST',
  body: JSON.stringify({ /* user-generated data */ })
})
```

✅ **Good**:
```typescript
// Server-side only: Automatically logged by guards
const session = await requireRole('ADMIN') // Logs automatically
```

### 3. No Role Spoofing

❌ **Bad**:
```typescript
// Don't trust user-provided role
const userRole = request.headers.get('x-user-role') // NEVER!
```

✅ **Good**:
```typescript
// Always get role from session/database
const session = await getServerSession()
const userRole = (session.user as any).role // From session, verified
```

## Analytics & Reporting

### Identify Attack Patterns

```typescript
// Find suspicious activity
const summary = await getAccessDenialSummary({ days: 7 })

// Sudden spike in denials?
if (summary.totalDenials > 1000) {
  // Send alert
  await sendSecurityAlert('High volume of access denials detected')
}

// Many attempts to access admin panel?
const adminAttempts = summary.topDeniedRoutes.find(r => r.route === '/dashboard/admin')
if (adminAttempts && adminAttempts.count > 50) {
  // Possible brute force attempt
  await sendSecurityAlert(`${adminAttempts.count} denied attempts to admin panel`)
}
```

### Monitor User Behavior

```typescript
// Is this user being repeatedly denied access?
const userDenials = await getAccessDenialLogs('user-123', { days: 30 })

if (userDenials.length > 20) {
  // User frequently denied - why?
  // - Missing role?
  // - Feature not enabled?
  // - Trying to access resources above their level?
  
  const reasons = userDenials.map(log => log.reason)
  console.log('Denial reasons for user-123:', reasons)
}
```

### Track Feature Rollout

```typescript
// Monitor feature adoption
const summary = await getAccessDenialSummary({ days: 7 })

// How many LEARNER denials for CREATE_COURSE?
const courseCreationDenials = summary.denialsByRoute['/api/courses']?.count || 0

// If very high, maybe feature not ready for rollout yet
if (courseCreationDenials > 100) {
  // Hold off on rolling out feature to LEARNER role
  console.log('High denial rate for CREATE_COURSE - feature not ready')
}
```

## Database Schema

```sql
-- ActivityLog table
CREATE TABLE "ActivityLog" (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  route VARCHAR(255), -- NEW: Route attempted
  userRole VARCHAR(50), -- NEW: User's role at time
  reason TEXT, -- NEW: Why denied
  pointsEarned INTEGER DEFAULT 0,
  createdBy VARCHAR(255),
  updatedBy VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP,
  
  INDEX idx_userId (userId),
  INDEX idx_action (action),
  INDEX idx_route (route), -- NEW: For route-based queries
  INDEX idx_userRole (userRole), -- NEW: For role-based analysis
  INDEX idx_timestamp (timestamp)
)
```

## Best Practices

1. **Always use guards** — Let `requireRole`, `requireServerRole`, `checkRole` handle logging
2. **Don't manually log** — Guards handle it automatically
3. **Provide context** — Use descriptive route/reason strings
4. **Monitor regularly** — Check denial patterns periodically
5. **Alert on spikes** — Set up monitoring for suspicious activity
6. **Keep logs** — Retain for compliance (at least 30 days)
7. **Rotate logs** — Archive old logs to separate storage

## Troubleshooting

### Logs not being created?

```typescript
// Check that you're using guard functions
// These automatically log:
- requireServerRole()    // Server components
- requireRole()          // API routes
- checkRole()            // Server actions
- requireFeature()       // Feature flags

// Don't manually log (guards do it for you)
```

### Missing userId in logs?

```typescript
// Ensure userId is passed when available
logAccessDenied({
  userId: sessionUserId, // Make sure this is not undefined
  userRole: userRole,
  route: pathname,
  reason: reason,
})

// For unauthenticated requests, userId can be 'ANONYMOUS'
```

### Logs getting soft-deleted?

```typescript
// When querying, filter out soft-deleted logs
const logs = await prisma.activityLog.findMany({
  where: {
    userId: 'user-123',
    deletedAt: null, // Exclude soft-deleted
  },
})

// Helper already does this
const logs = await getAccessDenialLogs('user-123')
```

## Summary

The audit logging system provides:

✅ **Automatic logging** of all access denials  
✅ **Non-blocking design** for performance  
✅ **Failure-safe** implementation  
✅ **Security-hardened** (no sensitive data, server-side only)  
✅ **Rich querying** for analytics and reporting  
✅ **Compliance-ready** with audit fields and soft delete  

**Everything is logged automatically — just use the guard functions!**
