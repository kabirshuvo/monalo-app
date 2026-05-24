# Deploy Monalo to Cloudflare Workers

Stack: **Next.js 16** + **OpenNext Cloudflare** + **Neon Postgres** + **R2** (`monalo-media`).

## Prerequisites

1. [Cloudflare account](https://dash.cloudflare.com)
2. Wrangler CLI (included: `npm install`)
3. Neon database migrated (`npm run db:reset` or `npm run db:migrate`)

## 1. Log in to Cloudflare

```bash
npx wrangler login
```

Opens a browser to authorize Wrangler.

## 2. Create R2 bucket (first time only)

```bash
npx wrangler r2 bucket create monalo-media
```

Name must match `wrangler.jsonc` → `bucket_name: "monalo-media"`.

## 3. Set production secrets on the Worker

Do **not** commit `.env`. Set secrets in Cloudflare:

```bash
npx wrangler secret put DATABASE_URL
# Paste pooled Neon URL: postgresql://...@ep-xxx-pooler.../neondb?sslmode=require

npx wrangler secret put NEXTAUTH_SECRET
# Paste your secret (generate: openssl rand -base64 32)

npx wrangler secret put NEXTAUTH_URL
# e.g. https://monalo-app.<your-subdomain>.workers.dev (or https://monalo.school after custom domain)

npx wrangler secret put NEXT_PUBLIC_APP_URL
# Same as public site URL

# Optional — gallery subdomain URL
npx wrangler secret put NEXT_PUBLIC_GALLERY_URL
# e.g. https://gallery.monalo.school

# Optional — R2 S3 API fallback (binding MEDIA_BUCKET is preferred)
npx wrangler secret put R2_ACCOUNT_ID
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put R2_BUCKET_NAME
# value: monalo-media
```

List secrets:

```bash
npx wrangler secret list
```

## 4. Build and deploy

```bash
npm install
npm run deploy
```

This runs:

1. `opennextjs-cloudflare build` — Next.js + Worker bundle
2. `opennextjs-cloudflare deploy` — uploads to Cloudflare

## 5. Preview before deploy (optional)

```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with real DATABASE_URL and NEXTAUTH_* values

npm run preview
```

Opens local Workers preview (default port often **8788**).

## 6. Custom domain (monalo.school)

Production secrets should use `https://monalo.school` (already set via `wrangler secret put`).

**If deploy fails with code 100117** (“hostname already has externally managed DNS records”):

1. Cloudflare Dashboard → **DNS** → zone **monalo.school**
2. Remove or update old records (e.g. Vercel `A` / `CNAME` on `@` and `www`)
3. Dashboard → **Workers & Pages** → **monalo-app** → **Settings** → **Domains & Routes** → **Add Custom Domain**
4. Add: `monalo.school`, `www.monalo.school`, `gallery.monalo.school`, `shop.`, `learn.`, `blog.`, `team.`
5. Cloudflare will create the correct DNS for the Worker

Or point DNS manually:

| Type  | Name    | Content              |
|-------|---------|----------------------|
| CNAME | `@`     | `monalo-app.kabirshuvo19.workers.dev` (if supported) or use Custom Domain wizard |
| CNAME | `www`   | same Worker          |
| CNAME | `gallery` | same Worker        |

Do **not** add `custom_domain` routes in `wrangler.jsonc` until old DNS records are cleared (see error 100117).

## 7. Post-deploy checks

- [ ] Home page loads
- [ ] Login works (`admin@monalo.test` / seed password)
- [ ] `/gallery`, `/shop`, `/courses` load
- [ ] Image upload (seller dashboard) — R2 binding
- [ ] Neon connection (no 500 on API routes)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `wrangler login` required | Run step 1 |
| Build fails with SQLite/workerd | Fixed: `initOpenNextCloudflareForDev` only in development |
| R2 bucket missing | `wrangler r2 bucket create monalo-media` |
| Auth redirect loop | `NEXTAUTH_URL` must match deployed URL exactly |
| DB errors on Worker | `DATABASE_URL` must be **Prisma Accelerate** URL (`prisma+postgres://...`), not raw Neon — see [PRISMA_ACCELERATE.md](./PRISMA_ACCELERATE.md) |
| `fs.readdir is not implemented` | Prisma Accelerate + edge client (fixed in `lib/db.ts`) |
| Prisma on Workers | `nodejs_compat` is set in `wrangler.jsonc` |

## CI/CD (GitHub Actions)

Use `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in GitHub secrets, then:

```yaml
- run: npm ci
- run: npm run deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```
