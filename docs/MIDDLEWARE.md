# Middleware Documentation

## Overview

The `middleware.ts` file at the project root implements role-based route protection using Next.js middleware and NextAuth JWT tokens. This runs on the edge before requests reach your pages, providing fast, secure access control.

## How It Works

### 1. Token Reading
- Uses `getToken()` from `next-auth/jwt` (edge-compatible)
- Reads JWT from secure HTTP-only cookies
- Validates token signature using `NEXTAUTH_SECRET`

### 2. Route Matching
- Matcher pattern: `/dashboard/:path*`
- Only dashboard routes trigger the middleware
- Configuration in `config.matcher` at the end of the file

### 3. Access Control Flow

```
Request to /dashboard/* route
    ↓
Middleware executes
    ↓
Does token exist in cookies?
    ├─ NO → Redirect to /login (with callbackUrl)
    └─ YES → Check user role
        ↓
    Is user role in required roles for route?
        ├─ NO → Redirect to /403 (Forbidden)
        └─ YES → Allow access with NextResponse.next()
```

## Protected Routes and Role Requirements

| Route | Required Role(s) | Example Users |
|-------|-----------------|----------------|
| `/dashboard/admin` | `ADMIN` | Only admin users |
| `/dashboard/writer` | `WRITER`, `ADMIN` | Writers and admins |
| `/dashboard/learner` | `LEARNER` | Learners only |
| `/dashboard/customer` | `CUSTOMER` | Customers only |

## Role Hierarchy

- **ADMIN** can access: `/dashboard/admin`, `/dashboard/writer`, and with code changes, any dashboard
- **WRITER** can access: `/dashboard/writer`
- **LEARNER** can access: `/dashboard/learner`
- **CUSTOMER** can access: `/dashboard/customer`

To give ADMIN access to all dashboards, modify `roleRequirements`:

```typescript
const roleRequirements: Record<string, string[]> = {
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/writer': ['WRITER', 'ADMIN'],
  '/dashboard/learner': ['LEARNER', 'ADMIN'],
  '/dashboard/customer': ['CUSTOMER', 'ADMIN'],
}
```

## Redirect Behavior

### Unauthenticated Users
```
User has no session cookie
    ↓
Redirect to /login?callbackUrl=/dashboard/admin
    ↓
After login, user is redirected back to /dashboard/admin
```

### Unauthorized Users (Insufficient Role)
```
User logged in but role insufficient
    ↓
Redirect to /403 (Forbidden page)
    ↓
User can:
  - Go to /home
  - Log in with different account
```

### Missing Role
```
User token exists but has no role
    ↓
Redirect to /home
```

## Environment Variables

Required in `.env.local`:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

The `NEXTAUTH_SECRET` is used to verify JWT token signatures. Without it, middleware will fail.

## Edge Compatibility

This middleware is edge-compatible because:
- ✅ Uses `getToken()` from `next-auth/jwt` (not `getServerSession()`)
- ✅ No direct database queries
- ✅ Only uses standard Web APIs
- ✅ Works on Vercel Edge Runtime

This means:
- Runs closer to users (faster)
- Can be deployed to Vercel Edge Functions
- Provides protection before reaching your server

## Adding New Protected Routes

To add a new protected route:

1. Create the page in `/app/dashboard/mynewdash/page.tsx`
2. Add role requirement to `roleRequirements`:
   ```typescript
   '/dashboard/mynewdash': ['ADMIN', 'WRITER'],
   ```
3. Create corresponding server component with `requireServerRole()` from `lib/auth/server-role.ts`

Example:

```typescript
// app/dashboard/mynewdash/page.tsx
import { requireServerRole } from '@/lib/auth/server-role'

export default async function MyNewDashboard() {
  // Double-check role (middleware already checked it)
  await requireServerRole(['ADMIN', 'WRITER'])
  
  return <div>Protected Content</div>
}
```

## Security Considerations

1. **Double Protection**: Dashboard pages also use `requireServerRole()` for additional validation
2. **Token Validation**: JWT signature verified with `NEXTAUTH_SECRET`
3. **HTTP-Only Cookies**: Tokens stored in secure HTTP-only cookies (not accessible via JavaScript)
4. **Edge Execution**: Runs on edge, preventing token exposure in server code

## Testing Middleware

### Test as Admin
1. Register with role ADMIN (via database seed or registration)
2. Visit `/dashboard/admin` → Should succeed
3. Visit `/dashboard/customer` → Should redirect to `/403`

### Test as Learner
1. Register with role LEARNER
2. Visit `/dashboard/learner` → Should succeed
3. Visit `/dashboard/admin` → Should redirect to `/403`

### Test Unauthenticated
1. Clear browser cookies (or use private/incognito window)
2. Visit `/dashboard/admin` → Should redirect to `/login?callbackUrl=/dashboard/admin`
3. After login, should redirect back to `/dashboard/admin`

## Debugging

### Middleware Not Triggering
- Check the matcher pattern includes your route: `/dashboard/:path*`
- Middleware only runs on routes matching the pattern

### Token Not Found
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Check that user is logged in (cookie exists)
- Use browser DevTools → Application → Cookies to inspect

### Role Not in Token
- Verify the `session.user` callback in `auth.config.ts` includes the role
- Check that database user record has a role value

## References

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [NextAuth.js JWT Documentation](https://next-auth.js.org/getting-started/example#jwt)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/edge-functions)
