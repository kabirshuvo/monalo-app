# Monalo School — Architecture

**Domain:** `monalo.school`  
**Repo:** `monalo-app` (single Next.js 16 app, multi-surface)

## Subdomain map

| Subdomain | Purpose | App routes (dev: same host) |
|-----------|---------|----------------------------|
| `monalo.school` | School hub, mission, donate | `/`, `/home`, `/about`, `/donate` |
| `shop.monalo.school` | Craft e-commerce | `/shop`, `/checkout` |
| `gallery.monalo.school` | Art sales | `/gallery` |
| `blog.monalo.school` | SEO articles | `/blog` |
| `learn.monalo.school` | Courses / LMS | `/courses`, `/dashboard/learning` |
| `team.monalo.school` | Freelancing services | `/team` |

## Routing strategy

### Production
- DNS: wildcard `*.monalo.school` → Cloudflare Worker / Vercel
- **Middleware** reads `request.headers.get('host')` and rewrites to route groups (Phase 8)
- **Auth cookies:** `domain: .monalo.school`, `NEXTAUTH_URL=https://monalo.school`

### Local development
- Default: path-based (`http://localhost:3000/shop`)
- Subdomain hosts in `/etc/hosts`:
  ```
  127.0.0.1 gallery.localhost shop.localhost learn.localhost
  ```
- Or query param: `?site=gallery` on localhost (see `lib/sites.ts`)

### Media (R2)
- Upload API: `POST /api/uploads` → Cloudflare R2 (`MEDIA_BUCKET`) or `public/uploads/` in dev
- Setup guide: [docs/R2_AND_SUBDOMAINS.md](./R2_AND_SUBDOMAINS.md)

## Shared platform

```
┌─────────────────────────────────────────────────────────┐
│  Next.js App (monalo-app)                               │
│  ├─ Auth (NextAuth + Prisma sessions)                   │
│  ├─ PostgreSQL (Neon)                                   │
│  ├─ Payments (Stripe)                                   │
│  └─ SchoolLedgerEntry (revenue by surface)                │
└─────────────────────────────────────────────────────────┘
```

## Roles (Prisma `Role` enum)

| Role | Primary surface |
|------|-----------------|
| `ADMIN` | All dashboards |
| `WRITER` | Blog, courses |
| `LEARNER` | Learn |
| `CUSTOMER` | Shop orders |
| `SELLER` | Shop + gallery listings |
| `DONOR` | Donations |
| `BROWSER` | Public read-only default |

## Environment variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://monalo.school
NEXT_PUBLIC_BASE_URL=https://monalo.school

# Per-surface (optional; defaults to BASE_URL + path)
NEXT_PUBLIC_SHOP_URL=https://shop.monalo.school
NEXT_PUBLIC_LEARN_URL=https://learn.monalo.school
NEXT_PUBLIC_BLOG_URL=https://blog.monalo.school
NEXT_PUBLIC_GALLERY_URL=https://gallery.monalo.school
NEXT_PUBLIC_TEAM_URL=https://team.monalo.school

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
SCHOOL_REVENUE_PERCENT=100
```

## Revenue sources → ledger

| Source | Model / flow |
|--------|----------------|
| SHOP | `Order` + Stripe webhook |
| COURSE | Enrollment payment |
| GALLERY | `Artwork` order (future) |
| TEAM | `ProjectRequest` invoice (future) |
| DONATION | `Donation` (future) |

## Build phases

See project chat todo list: Phase 1 (foundation) → Phase 2 (hub) → 3–7 (surfaces) → 8 (subdomains).
