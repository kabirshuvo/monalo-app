# R2 media uploads & gallery.monalo.school

## R2 bucket setup (Cloudflare dashboard)

1. Create bucket: **monalomedia** (must match `wrangler.jsonc`).
2. Create API token: **R2 Read & Write** for that bucket.
3. Optional: connect custom domain **media.monalo.school** (public access) → set `R2_PUBLIC_BASE_URL=https://media.monalo.school`.
4. If the bucket stays private, images are served via `/api/media/{key}`.

### Environment variables

```env
# S3-compatible API (works in next dev + Cloudflare Workers with nodejs_compat)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=monalomedia
R2_PUBLIC_BASE_URL=https://media.monalo.school

# App URLs (production)
NEXT_PUBLIC_APP_URL=https://monalo.school
NEXT_PUBLIC_GALLERY_URL=https://gallery.monalo.school
NEXT_PUBLIC_SHOP_URL=https://shop.monalo.school
```

On Workers deploy, `MEDIA_BUCKET` binding in `wrangler.jsonc` is used first; S3 API vars are the fallback.

### Local development

Without R2 credentials, uploads save to `public/uploads/` and URLs look like `/uploads/gallery/uuid.jpg`.

```bash
npm install
npm run dev
```

Upload as **seller@monalo.test** from `/dashboard/seller/artworks`.

---

## gallery.monalo.school

### DNS (Cloudflare)

| Type | Name | Target |
|------|------|--------|
| CNAME | gallery | your Workers/Pages host (same as main app) |

Wildcard or per-subdomain CNAMEs for `shop`, `learn`, `blog`, `team` when ready.

### Routing

Middleware rewrites:

| Request on gallery host | Serves |
|-------------------------|--------|
| `/` | `/gallery` |
| `/morning-light-hill` | `/gallery/morning-light-hill` |
| `/login` | `/login` (no rewrite) |

### Local testing

**Option A — hosts file**

```
127.0.0.1 gallery.localhost
```

Visit http://gallery.localhost:3000/

**Option B — query param**

http://localhost:3000/gallery?site=gallery  
(rewrites only when using paths that trigger middleware; prefer hosts for full subdomain UX)

### Cookies / auth

Set `NEXTAUTH_URL` to your primary origin. For shared login across subdomains, configure session cookies with `domain: .monalo.school` in NextAuth (production).

---

## Wrangler deploy

```bash
npx wrangler r2 bucket create monalomedia
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npm run deploy
```
