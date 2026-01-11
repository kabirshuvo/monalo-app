# Audit Logging Quick Reference

## Overview

Server-side audit logging automatically tracks access attempts (allowed/denied) for all RBAC-protected resources.

## What Gets Logged (Automatically)

| Event | When | Logged By |
|-------|------|-----------|
| **AUTH_FAILURE** | No session, token expired | `requireRole`, `requireServerRole`, `checkRole` |
| **DENIED_ACCESS** | Role insufficient | `requireRole`, `requireServerRole`, `checkRole` |
| **FEATURE_DENIED** | Feature not enabled for role | `requireFeature` |

## Files

| File | Purpose | Lines |
|------|---------|-------|
| [lib/auth/audit-logs.ts](../lib/auth/audit-logs.ts) | Audit logging utility | 430 |
| [docs/AUDIT_LOGGING.md](../docs/AUDIT_LOGGING.md) | Full guide | 300+ |
| [docs/IMPLEMENTATION_AUDIT_LOGGING.md](../docs/IMPLEMENTATION_AUDIT_LOGGING.md) | Summary | 200+ |

## Logged Data

```typescript
{
  id: string              // Unique log ID (crypto.randomUUID)
  userId: string          // User attempting access
  userRole: string|null   // Their role
  route: string           // Resource attempted
  reason: string          // Why denied
  action: string          // Event type
  timestamp: Date         // When it happened
  createdBy: string       // Who triggered (usually userId)
  deletedAt: Date|null    // Soft delete
}
```

## Integration (No Manual Calls Needed)

### Server Components
```typescript
// app/dashboard/admin/page.tsx
await requireServerRole('ADMIN')  // ← Logs automatically
```

### API Routes
```typescript
// app/api/courses/route.ts
const session = await requireRole('ADMIN')  // ← Logs automatically
```

### Server Actions
```typescript
// app/actions/course.ts
const session = await checkRole('ADMIN')  // ← Logs automatically
```

### Feature Flags
```typescript
// Requires userId and route params
requireFeature(userRole, 'CREATE_COURSE', {
  userId: sessionUserId,
  route: '/api/courses'
})  // ← Logs automatically
```

## Querying

### Get Denials for User
```typescript
import { getAccessDenialLogs } from '@/lib/auth/audit-logs'

const logs = await getAccessDenialLogs('user-123', { days: 30 })
```

### Get Denials by Role
```typescript
import { getAccessDenialsByRole } from '@/lib/auth/audit-logs'

const logs = await getAccessDenialsByRole('LEARNER', { days: 30 })
```

### Get Denials by Route
```typescript
import { getAccessDenialsByRoute } from '@/lib/auth/audit-logs'

const logs = await getAccessDenialsByRoute('/dashboard/admin', { days: 7 })
```

### Get Summary
```typescript
import { getAccessDenialSummary } from '@/lib/auth/audit-logs'

const summary = await getAccessDenialSummary({ days: 30 })
// Returns: { totalDenials, denialsByRole, topDeniedRoutes, topDeniedRoles }
```

## Important Notes

✅ **Automatic** — No manual logging needed, guards handle it  
✅ **Non-Blocking** — Fire-and-forget, never blocks authorization  
✅ **Failure-Safe** — Logging failures never crash the app  
✅ **Server-Side Only** — Never triggered from middleware or client  
✅ **Secure** — No sensitive data logged, verified source data  

## Schema

```sql
ActivityLog {
  id:        String (PRIMARY KEY)
  userId:    String (NOT NULL)
  action:    String (NOT NULL)          -- DENIED_ACCESS, AUTH_FAILURE, etc.
  route:     String (NULLABLE)           -- /dashboard/admin
  userRole:  String (NULLABLE)           -- ADMIN, LEARNER, WRITER, CUSTOMER
  reason:    Text (NULLABLE)             -- Why denied
  timestamp: DateTime (DEFAULT NOW())
  createdBy: String (NULLABLE)
  deletedAt: DateTime (NULLABLE)         -- Soft delete

  INDEXES: userId, timestamp, action, route, userRole
}
```

## Example: Check Admin Panel Access Attempts

```typescript
// In admin dashboard page
import { getAccessDenialsByRoute } from '@/lib/auth/audit-logs'

const adminPanelDenials = await getAccessDenialsByRoute('/dashboard/admin', {
  days: 7
})

if (adminPanelDenials.length > 50) {
  // Alert: suspicious activity
  console.warn(`${adminPanelDenials.length} blocked attempts to admin panel`)
}
```

## Example: Monitor Access Patterns

```typescript
import { getAccessDenialSummary } from '@/lib/auth/audit-logs'

const summary = await getAccessDenialSummary({ days: 30 })

console.log('Total denials:', summary.totalDenials)
console.log('By role:', summary.denialsByRole)
console.log('Top denied routes:', summary.topDeniedRoutes)

// Output example:
// Total denials: 156
// By role: { LEARNER: 120, WRITER: 36 }
// Top denied routes: [
//   { route: '/dashboard/admin', count: 98 },
//   { route: '/api/users', count: 45 }
// ]
```

## Security Best Practices

❌ **Don't** log sensitive data (passwords, tokens, PII)  
✅ **Do** log general reason ("Insufficient role: LEARNER not in [ADMIN]")  

❌ **Don't** call logging from client code  
✅ **Do** let server-side guards handle it automatically  

❌ **Don't** trust JWT role claims in middleware  
✅ **Do** validate role from session/database on server  

## Troubleshooting

**Logs not created?**
- Ensure using guard functions (requireRole, requireServerRole, checkRole, requireFeature)
- Guards log automatically, no manual calls needed

**Missing userId?**
- Guard functions automatically extract userId from session
- For unauthenticated requests, use 'ANONYMOUS'

**Logs with deletedAt filled?**
- Query helpers filter out soft-deleted logs by default
- Use `deletedAt: null` in custom queries

## Related Files

- [AUDIT_LOGGING.md](./AUDIT_LOGGING.md) — Comprehensive guide
- [AUTHENTICATION.md](./AUTHENTICATION.md) — Auth system overview
- [FEATURE_FLAGS.md](./FEATURE_FLAGS.md) — Feature flag system
- [lib/auth/audit-logs.ts](../lib/auth/audit-logs.ts) — Implementation
