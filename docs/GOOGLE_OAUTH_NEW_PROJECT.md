# Google OAuth — GCP project `monaloauth`

| Field | Value |
|--------|--------|
| Project name | monaloAuth |
| Project ID | `monaloauth` |
| Project number | `1081795752271` |

Use this project **only** for MonAlo sign-in (not `gen-lang-client` or other apps).

## 1. Project (done)

You created **monaloAuth** (`monaloauth`). Select it in the [Cloud Console project picker](https://console.cloud.google.com/home/dashboard?project=monaloauth).

## 2. Configure OAuth consent screen

1. [OAuth consent screen — monaloauth](https://console.cloud.google.com/auth/branding?project=monaloauth)
2. **User type:** External → **Create**
3. **App information**
   - App name: `MonAlo`
   - User support email: your email
   - App logo: optional
4. **App domain** (optional for testing; add for production)
   - Application home page: `https://monalo.school`
   - Privacy policy / Terms: add when you have URLs
5. **Developer contact:** your email
6. **Scopes:** keep defaults (`openid`, `email`, `profile`) — Auth.js requests these automatically
7. **Test users:** add your Gmail (and teammates) while status is **Testing**
8. Save

> While in **Testing**, only test users can sign in. For public launch, submit for **Verification** or publish to production when Google allows.

## 3. Create OAuth 2.0 Web client

1. [Credentials — monaloauth](https://console.cloud.google.com/apis/credentials?project=monaloauth) → **Create credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name: `MonAlo Web`
4. **Authorized JavaScript origins**

   ```
   http://localhost:3000
   https://monalo.school
   ```

5. **Authorized redirect URIs**

   ```
   http://localhost:3000/api/auth/callback/google
   https://monalo.school/api/auth/callback/google
   ```

6. **Create** → copy **Client ID** and **Client secret**

## 4. Add to MonAlo

**Local** (`.env`):

```env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
```

Restart: `npm run dev`

**Production** (Cloudflare Worker):

```bash
echo 'YOUR_CLIENT_ID' | npx wrangler secret put GOOGLE_CLIENT_ID
echo 'YOUR_CLIENT_SECRET' | npx wrangler secret put GOOGLE_CLIENT_SECRET
npm run deploy
```

## 5. Verify

1. Open `http://localhost:3000/login`
2. **Continue with Google** should appear (after env vars are set)
3. Sign in with a **test user** email added in the consent screen

## Subdomains (optional)

Google sign-in runs on `monalo.school` with redirect to `/api/auth/callback/google` on the same host. Subdomains (`learn.monalo.school`, etc.) share the session cookie (`.monalo.school`) — no extra OAuth clients needed unless you host login on another domain.

## Troubleshooting

| Error | Fix |
|--------|-----|
| `redirect_uri_mismatch` | Add **exact** URI under **Authorized redirect URIs** (not JavaScript origins only). No trailing `/`. Wait 1–5 min after saving. |

### Local dev — copy/paste exactly

**Authorized JavaScript origins** (separate field):

```
http://localhost:3000
```

**Authorized redirect URIs** (required — this fixes Error 400):

```
http://localhost:3000/api/auth/callback/google
```

Optional if you use `127.0.0.1`:

```
http://127.0.0.1:3000
http://127.0.0.1:3000/api/auth/callback/google
```

**Production** (same OAuth client):

```
https://monalo.school
http://localhost:3000
```

```
https://monalo.school/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

Direct link: [Credentials — monaloauth](https://console.cloud.google.com/apis/credentials?project=monaloauth) → click your **Web client** name → edit URIs → **Save**.
| `access_denied` / 403 | Add your Google account under **Test users** |
| Button missing locally | Set both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, restart dev server |
| Works locally, fails on prod | Set Wrangler secrets and redeploy; add `https://monalo.school` origins/redirects |
