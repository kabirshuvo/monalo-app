# Prisma Accelerate (Cloudflare Workers + Neon)

Cloudflare Workers cannot run the standard Prisma query engine (`fs.readdir` errors). Use **Prisma Accelerate** with your existing **monalo** project on [console.prisma.io](https://console.prisma.io).

## 1. Get the Accelerate URL (existing project **monalo**)

1. Open [console.prisma.io](https://console.prisma.io/) → project **monalo**
2. **Database** → ensure the connection string is your **Neon unpooled URL** (same as `DATABASE_URL_UNPOOLED` in `.env`, host `ep-dry-dew-...`).  
   If Accelerate points at a different database, gallery/shop APIs will 500 or return empty data (missing `artworks` table).
3. Open **Accelerate** → enable if off → copy the connection string:
   ```text
   prisma+postgres://accelerate.prisma-data.net/?api_key=...
   ```

## 2. Environment layout

| Variable | Local `.env` | Cloudflare Worker secret |
|----------|--------------|---------------------------|
| `DATABASE_URL` | Keep **direct Neon pooled** URL (dev) | **Accelerate URL** from step 1 |
| `DATABASE_URL_UNPOOLED` | Direct Neon (migrations/seed) | Not needed on Worker |

Optional: add `ACCELERATE_URL` in `.env` with the Accelerate string and keep `DATABASE_URL` as Neon locally. The app uses Accelerate when either `ACCELERATE_URL` is set or `DATABASE_URL` starts with `prisma://` / `prisma+postgres://`.

Example local `.env` (recommended):

```env
DATABASE_URL=postgresql://...@ep-xxx-pooler.../neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://...@ep-xxx.../neondb?sslmode=require
ACCELERATE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=...
```

## 3. Set Cloudflare secret (production)

```bash
npx wrangler secret put DATABASE_URL --name monalo
```

Paste the **Accelerate** connection string when prompted (not the `postgresql://` Neon URL).

## 4. Redeploy

```bash
npm run deploy
```

## 5. Verify

```bash
curl -sI https://monalo.school/api/gallery
curl -sI https://gallery.monalo.school
```

Both should return **200**, not **500**.

## How the app uses it

`lib/db.ts` detects Accelerate and uses:

- `@prisma/client/edge`
- `@prisma/extension-accelerate`

Migrations and seed use `DATABASE_URL_UNPOOLED` via `prisma/schema.prisma` → `directUrl`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Still `fs.readdir` on Worker | Worker `DATABASE_URL` is still direct Neon — set Accelerate secret and redeploy |
| Accelerate disabled in console | Enable Accelerate on project **monalo** |
| Wrong database | Re-link Neon in Prisma console to match `ep-dry-dew-...` in `.env` |
| Migrations fail | Use `DATABASE_URL_UNPOOLED`, not the Accelerate URL, for `npm run db:migrate` |
