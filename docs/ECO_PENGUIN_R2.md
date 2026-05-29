# Eco Penguin assets on Cloudflare R2

Your Cloudflare account is already set up. This doc maps dashboard values to MonAlo env + commands.

## Your R2 setup

| Setting | Value |
|---------|--------|
| Account ID | `551aa3726dff734e7e9a82fc748927c4` |
| Bucket | `monalomedia` |
| Prefix (folder) | `eco-penguine/` |
| Custom domain | [https://media.monalo.school](https://media.monalo.school) |
| S3 API endpoint | `https://551aa3726dff734e7e9a82fc748927c4.r2.cloudflarestorage.com/monalomedia` |
| Public dev URL (not for prod) | `https://pub-1023ca6647ff449baf7f3f8c6e650fc8.r2.dev` |
| Workers subdomain | `kabirshuvo19.workers.dev` |

Example asset URL (what the app generates when configured):

`https://media.monalo.school/eco-penguine/images/categories/animals.webp`

Dashboard: [monalomedia bucket](https://dash.cloudflare.com/551aa3726dff734e7e9a82fc748927c4/r2/default/buckets/monalomedia?prefix=eco-penguine%2F)

## 1. Environment variables

### Local (`.env` / `.env.local` / `.dev.vars`)

```env
R2_ACCOUNT_ID=551aa3726dff734e7e9a82fc748927c4
R2_ACCESS_KEY_ID=<from R2 → Manage R2 API tokens → S3 credentials>
R2_SECRET_ACCESS_KEY=<same token>
R2_BUCKET_NAME=monalomedia
R2_PUBLIC_BASE_URL=https://media.monalo.school
```

Create **R2 API token** in the dashboard: R2 → Overview → Manage R2 API tokens → Create API token with **Object Read & Write** on `monalomedia`.

### Production Worker (Wrangler secrets)

```bash
npx wrangler secret put R2_ACCOUNT_ID
# paste: 551aa3726dff734e7e9a82fc748927c4

npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put R2_BUCKET_NAME
# paste: monalomedia

npx wrangler secret put R2_PUBLIC_BASE_URL
# paste: https://media.monalo.school
```

`wrangler.jsonc` already binds `MEDIA_BUCKET` → `monalomedia`.

Rebuild/deploy after setting `R2_PUBLIC_BASE_URL` so `next/image` allows `media.monalo.school`.

## 2. Upload Eco Penguin files

From repo root (needs `public/ecopenguin/` with images + audio):

```bash
npm run ecopenguin:upload-r2
```

This writes keys like `eco-penguine/images/...` and `eco-penguine/audio/...`.

Skip existing objects (faster re-run):

```bash
node scripts/upload-ecopenguin-r2.mjs
```

Overwrite all:

```bash
node scripts/upload-ecopenguin-r2.mjs --force
```

## 3. Verify in browser

Open:

1. `https://media.monalo.school/eco-penguine/images/categories/animals.webp` — should show an image  
2. `/learning/ecopenguin` on MonAlo — category cards and audio should load from `media.monalo.school`

If images work in the tab but not in the app, fix **CORS** (step 4).

## 4. CORS (required for audio in the browser)

Eco Penguin plays `.mp3` from R2 in the browser. The app origin (e.g. `https://monalo.school`) must be allowed on the bucket.

You already have `http://localhost:3000` + `GET`. Add production origins.

### Option A — Dashboard

R2 → **monalomedia** → Settings → CORS → edit rule:

- **Allowed origins:** `http://localhost:3000`, `https://monalo.school`, `https://www.monalo.school`
- **Allowed methods:** `GET`, `HEAD`

### Option B — API script

```bash
export CLOUDFLARE_API_TOKEN=<token with R2 Edit>
npm run ecopenguin:configure-cors
```

Uses `config/ecopenguin-r2-cors.json`.

Cloudflare API: `PUT /accounts/{account_id}/r2/buckets/{bucket_name}/cors`

## 5. How MonAlo picks URLs

| Situation | Media base |
|-----------|------------|
| `R2_PUBLIC_BASE_URL` set | `https://media.monalo.school/eco-penguine` |
| R2 keys only, no public URL | `https://monalo.school/api/media/eco-penguine` |
| No R2 configured | `/ecopenguin` (local `public/ecopenguin/`) |

Code: `lib/ecopenguin/media-origin.ts`, `lib/ecopenguin/assets.ts`.

## 6. Object layout in R2

```text
monalomedia/
  eco-penguine/
    images/
      categories/
      animals/
      ...
    audio/
      this/
      which/
      correct/
      error/
```

JSON metadata stays in the repo under `data/ecopenguin/` (not in R2).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 404 on media.monalo.school | Upload with `npm run ecopenguin:upload-r2`; confirm prefix `eco-penguine/` in dashboard |
| Images broken only in app | Add CORS origins for your site |
| Works locally, not in prod | Set Wrangler secrets + redeploy; set `R2_PUBLIC_BASE_URL` at build time |
| Wrong bucket in Worker | Confirm `wrangler.jsonc` `bucket_name` is `monalomedia` |
