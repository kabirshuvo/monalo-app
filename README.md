# Monalo App

Next.js 16 (App Router, React 19, TypeScript, Tailwind 4) app for Monalo School. It combines:

- **Eco Penguin**: a kids' phonics platform under `/learning` with 16 activities (letter sounds, digraphs, blends, build/segment/blend-the-word, balloon letters, read-a-story, say-it, sight words, write-it, nursery rhymes, and more), plus points, stickers, group unlocks, and parent progress.
- **Shop**: products, cart, orders.
- **Content and learning**: blog, gallery, courses and lessons, classroom mode, role applications.

## Stack

| Area | Choice |
|---|---|
| Auth | Auth.js v5 (`next-auth` beta), JWT sessions, custom Prisma adapter; credentials, Google, magic link (Resend) |
| Data | PostgreSQL via Prisma 6 (driver adapter `@prisma/adapter-pg`, Accelerate on Workers) |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare` |
| Media | Cloudflare R2 (S3 SDK), served through `/api/media` |
| Roles | `ADMIN, CUSTOMER, LEARNER, WRITER, SELLER, DONOR, GUARDIAN, SPONSOR` |

## Layout

```
app/        routes and API handlers (app/api/learning/<activity>/celebrate = points)
features/   UI per learning activity
lib/        domain logic (auth, db, points, per-activity data helpers, sites)
components/ shared UI (components/ui is the design system)
prisma/     schema, migrations, seed
scripts/    db, admin, and R2 upload tooling
docs/       architecture, deploy, auth, design system, R2 notes
middleware.ts  auth gate + subdomain routing (lib/sites.ts)
```

## Local development

```bash
npm install
cp .dev.vars.example .env.local   # fill in DATABASE_URL, AUTH_SECRET, ...
npm run db:migrate
npm run seed
npm run dev
```

Useful commands:

| Command | Purpose |
|---|---|
| `npm run build` | Prisma generate + production build |
| `npm run lint` | ESLint |
| `npm run preview` / `deploy` | Build and run or deploy on Cloudflare |
| `npm run make-admin` | Promote a user to ADMIN |
| `npm run *:upload-r2` | Upload learning media to R2 |

Subdomain routing (`shop.`, `gallery.`, `learn.`, `blog.`, `team.`) is described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Locally, paths work on one host, or use `?site=<name>`.

## Docs

[Architecture](docs/ARCHITECTURE.md) · [Authentication](docs/AUTHENTICATION.md) · [Middleware](docs/MIDDLEWARE.md) · [Database](docs/DATABASE_SETUP.md) · [Cloudflare deploy](docs/DEPLOY_CLOUDFLARE.md) · [Eco Penguin R2](docs/ECO_PENGUIN_R2.md) · [Design system](docs/DESIGN_SYSTEM.md) · [Copy guides](docs/copy/)
