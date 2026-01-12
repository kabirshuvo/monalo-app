# OAuth Social Login Setup Guide

**Date:** January 13, 2026  
**Status:** ⚠️ **REQUIRES CONFIGURATION**  
**Priority:** HIGH - OAuth credentials must be configured before social login works

---

## Overview

MonAlo now supports three OAuth providers for social login:
- ✅ **Google OAuth 2.0**
- ✅ **Facebook Login**
- ✅ **X (Twitter) OAuth 2.0**

Users can sign in or register using their existing social media accounts, providing a faster and more convenient authentication experience.

---

## What's Been Implemented

### 1. Auth Configuration (`auth.config.ts`)
- ✅ Added GoogleProvider
- ✅ Added FacebookProvider
- ✅ Added TwitterProvider
- ✅ Configured proper OAuth scopes
- ✅ Set up callback URLs

### 2. Login Page (`app/(auth)/login/page.tsx`)
- ✅ Added "Or continue with" divider
- ✅ Added Google sign-in button with official brand colors
- ✅ Added Facebook sign-in button with official brand colors
- ✅ Added X sign-in button with official brand icon
- ✅ All buttons use consistent styling (secondary variant)
- ✅ Proper spacing and visual hierarchy

### 3. Register Page (`app/(auth)/register/page.tsx`)
- ✅ Added "Or sign up with" divider
- ✅ Added same three social login buttons
- ✅ Consistent styling with login page

### 4. User Experience
- ✅ Social buttons appear below email/password form
- ✅ Visual divider separates traditional and social login
- ✅ Buttons follow brand guidelines for each provider
- ✅ Disabled state during authentication
- ✅ Proper callback URL handling

---

## What You Need to Do

### Step 1: Create OAuth Applications

You need to create OAuth applications with each provider and obtain client credentials.

#### A. Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: "MonAlo" (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (unless you have a Google Workspace)
   - Fill in:
     - App name: MonAlo
     - User support email: your-email@example.com
     - Developer contact: your-email@example.com
   - Click "Save and Continue"
   - Scopes: Keep defaults (email, profile, openid)
   - Test users: Add your email for testing
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "MonAlo Web App"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://yourdomain.com/api/auth/callback/google` (prod)
   - Click "Create"

6. **Copy Your Credentials**
   - Client ID: `123456789-abcdef.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxx`
   - Save these for the .env file

---

#### B. Facebook OAuth Setup

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/

2. **Create an App**
   - Click "My Apps" → "Create App"
   - Use case: "Authenticate and request data from users with Facebook Login"
   - App type: "Consumer"
   - Display name: MonAlo
   - App contact email: your-email@example.com
   - Click "Create App"

3. **Add Facebook Login Product**
   - From dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"

4. **Configure Facebook Login Settings**
   - Go to "Facebook Login" → "Settings"
   - Valid OAuth Redirect URIs:
     - `http://localhost:3000/api/auth/callback/facebook` (dev)
     - `https://yourdomain.com/api/auth/callback/facebook` (prod)
   - Save changes

5. **Get Your App Credentials**
   - Go to "Settings" → "Basic"
   - App ID: `1234567890123456`
   - App Secret: Click "Show" to reveal
   - Save these for the .env file

6. **Set App to Live Mode** (when ready for production)
   - By default, apps are in Development mode
   - To go live: Complete "App Review" requirements
   - For testing: Add test users in "Roles" section

---

#### C. X (Twitter) OAuth Setup

1. **Go to Twitter Developer Portal**
   - Visit: https://developer.twitter.com/

2. **Create a Project and App**
   - Sign in with your Twitter account
   - Click "Projects & Apps" → "Create Project"
   - Project name: MonAlo
   - Use case: Select appropriate category
   - Description: Learning platform authentication
   - Click "Next"

3. **Create an App**
   - App name: MonAlo Web App
   - Click "Complete"

4. **Configure OAuth 2.0 Settings**
   - Go to your app settings
   - Click "Settings" tab
   - Enable "OAuth 2.0" (recommended over OAuth 1.0a)
   - Set Type of App: "Web App"
   - Callback URLs:
     - `http://localhost:3000/api/auth/callback/twitter` (dev)
     - `https://yourdomain.com/api/auth/callback/twitter` (prod)
   - Website URL: `https://yourdomain.com`
   - Save

5. **Generate Client ID and Secret**
   - Go to "Keys and tokens" tab
   - Under "OAuth 2.0 Client ID and Client Secret"
   - Click "Generate"
   - Copy both values immediately (secret is shown only once)
   - Client ID: `a1b2c3d4e5f6g7h8i9j0`
   - Client Secret: `xxxxxxxxxxxxxxxxxxxxx`

6. **Request Additional Permissions** (if needed)
   - By default, you get basic profile and email
   - For elevated access: Apply through Twitter Developer Portal

---

### Step 2: Configure Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# X (Twitter) OAuth
TWITTER_CLIENT_ID=a1b2c3d4e5f6g7h8i9j0
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# Database (existing)
DATABASE_URL=your-existing-database-url
```

### Important Notes on Environment Variables:

1. **NEXTAUTH_SECRET**: Generate a secure random string
   ```bash
   # Generate on Linux/Mac:
   openssl rand -base64 32
   
   # Or use this Node.js command:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **NEXTAUTH_URL**: 
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com` (your actual domain)

3. **Never commit `.env.local` to Git**
   - Already in `.gitignore`
   - Store production secrets in environment variables on your hosting platform

---

### Step 3: Update Database Schema (If Needed)

The Prisma adapter should already support OAuth accounts. Verify your schema has:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

If you need to add this, run:
```bash
npx prisma db push
```

---

### Step 4: Test OAuth Flows

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Google Login**
   - Go to `http://localhost:3000/login`
   - Click "Continue with Google"
   - Should redirect to Google consent screen
   - After consent, should redirect back to your app
   - Should be logged in and redirected to dashboard

3. **Test Facebook Login**
   - Go to `http://localhost:3000/login`
   - Click "Continue with Facebook"
   - Should redirect to Facebook login
   - After authorization, should redirect back
   - Should be logged in

4. **Test X Login**
   - Go to `http://localhost:3000/login`
   - Click "Continue with X"
   - Should redirect to X authorization
   - After authorization, should redirect back
   - Should be logged in

---

## User Flow

### New User Registration via OAuth

1. User clicks "Continue with Google" (or Facebook/X)
2. Redirected to provider's consent screen
3. User grants permissions
4. Provider redirects back to `/api/auth/callback/[provider]`
5. NextAuth creates:
   - New `User` record (if email doesn't exist)
   - New `Account` record linking user to OAuth provider
   - New `Session` record
6. User redirected to dashboard
7. First-time users see welcome screen (if implemented)

### Existing User Login via OAuth

1. User clicks social login button
2. Redirected to provider
3. User already authorized → quick redirect back
4. NextAuth finds existing `Account` record
5. Creates new session
6. User logged in and redirected

### Account Linking (Future Enhancement)

Currently, each OAuth provider creates a separate account. If you want to:
- Allow users to link multiple OAuth providers to one account
- Merge accounts with the same email

You'll need to implement custom account linking logic in the NextAuth callbacks.

---

## Security Considerations

### 1. Client Secret Protection
- ✅ Never expose client secrets in client-side code
- ✅ All OAuth flows handled server-side by NextAuth
- ✅ Secrets stored in environment variables only

### 2. Callback URL Validation
- ✅ OAuth providers validate callback URLs
- ✅ Must match exactly what's registered
- ✅ Cannot be manipulated by attackers

### 3. CSRF Protection
- ✅ NextAuth automatically handles CSRF tokens
- ✅ State parameter used in OAuth flow
- ✅ Prevents authorization code interception

### 4. Session Security
- ✅ Database-backed sessions (more secure than JWT-only)
- ✅ 30-day session expiration
- ✅ Sessions can be revoked from database

### 5. Email Verification
- ⚠️ OAuth providers verify emails
- ⚠️ But you should still verify email ownership for credentials login
- 💡 Consider marking OAuth-registered users as "email verified"

---

## Troubleshooting

### "Error: Configuration error"
**Cause:** Missing or invalid environment variables  
**Fix:** Check that all required env vars are set in `.env.local`

### "Redirect URI mismatch"
**Cause:** Callback URL doesn't match what's registered  
**Fix:** 
- Dev: Ensure `http://localhost:3000/api/auth/callback/[provider]` is registered
- Prod: Ensure `https://yourdomain.com/api/auth/callback/[provider]` is registered

### "Invalid client secret"
**Cause:** Wrong secret or ID  
**Fix:** Double-check credentials copied from provider dashboards

### "Access denied"
**Cause:** User declined permissions or app not approved  
**Fix:**
- Ensure app is in correct mode (dev/live)
- Check required permissions/scopes
- For Facebook: May need app review for certain permissions

### OAuth button doesn't work
**Cause:** Missing provider or credentials  
**Fix:**
- Check browser console for errors
- Verify provider is enabled in `auth.config.ts`
- Ensure environment variables are loaded (restart dev server)

### User created but wrong role assigned
**Cause:** OAuth users get default role (CUSTOMER)  
**Fix:** Implement role selection during first OAuth login in callbacks

---

## Brand Guidelines Compliance

### Google Sign-In Button
- ✅ Uses official Google colors (#4285F4, #34A853, #FBBC05, #EA4335)
- ✅ Uses official Google logo SVG
- ✅ Text: "Continue with Google" (approved wording)
- ✅ Secondary button style (gray background)

### Facebook Login Button
- ✅ Uses official Facebook blue (#1877F2)
- ✅ Uses official Facebook logo SVG
- ✅ Text: "Continue with Facebook"
- ✅ Consistent styling with other buttons

### X (Twitter) Button
- ✅ Uses current X branding (new logo)
- ✅ Black icon on gray background
- ✅ Text: "Continue with X"
- ✅ Matches current Twitter/X brand guidelines

All buttons follow WCAG accessibility guidelines:
- ✅ Sufficient color contrast
- ✅ Keyboard accessible (Tab + Enter)
- ✅ Focus rings visible
- ✅ Disabled state clear

---

## Production Checklist

Before launching OAuth in production:

- [ ] All OAuth apps created and approved
- [ ] Production callback URLs registered with all providers
- [ ] Environment variables set in production hosting platform
- [ ] NEXTAUTH_URL set to production domain
- [ ] NEXTAUTH_SECRET is strong and unique (never reused)
- [ ] Database schema includes Account model
- [ ] OAuth buttons tested on staging environment
- [ ] Error handling tested (declined permissions, network errors)
- [ ] Account linking strategy decided
- [ ] Privacy policy updated to mention third-party auth
- [ ] Terms of service updated (if needed)
- [ ] GDPR compliance reviewed (if applicable)
- [ ] User data retention policy defined
- [ ] OAuth provider terms of service reviewed

---

## Next Steps (Optional Enhancements)

### 1. Account Linking
Allow users to link multiple OAuth providers to one account:
```typescript
// In auth callbacks
async linkAccount({ user, account, profile }) {
  // Check if email exists
  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email }
  })
  
  if (existingUser) {
    // Link this OAuth account to existing user
    await prisma.account.create({
      data: {
        userId: existingUser.id,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        // ... other fields
      }
    })
  }
}
```

### 2. Role Selection for OAuth Users
Add a role selection step after first OAuth login:
- Redirect to `/onboarding/role` after first OAuth sign-in
- Present role options (Customer, Learner, Writer)
- Update user role in database
- Then redirect to dashboard

### 3. Profile Photo from OAuth
Use the profile photo from OAuth provider:
```typescript
// In signIn callback
async signIn({ user, account, profile }) {
  if (account?.provider === 'google') {
    // Update user avatar
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: profile.picture }
    })
  }
}
```

### 4. Additional Providers
NextAuth supports many other providers:
- GitHub
- LinkedIn
- Discord
- Apple
- Microsoft
- And many more...

To add more providers, follow the same pattern in `auth.config.ts`.

---

## Cost Considerations

### Free Tiers

**Google OAuth:**
- ✅ Unlimited sign-ins (free)
- ✅ No cost for authentication

**Facebook Login:**
- ✅ Unlimited sign-ins (free)
- ✅ No cost for basic profile data

**X (Twitter) OAuth:**
- ✅ Free tier: 1,500 app requests per month
- ⚠️ May need paid tier for high-volume apps
- 💰 Basic tier: $100/month for higher limits

### Rate Limits
- All providers have rate limits
- Implement caching if needed
- Monitor usage in provider dashboards

---

## Support & Documentation

### NextAuth.js
- Docs: https://next-auth.js.org/
- Providers: https://next-auth.js.org/providers/

### Google
- Console: https://console.cloud.google.com/
- Docs: https://developers.google.com/identity

### Facebook
- Developers: https://developers.facebook.com/
- Docs: https://developers.facebook.com/docs/facebook-login

### X (Twitter)
- Developer Portal: https://developer.twitter.com/
- Docs: https://developer.twitter.com/en/docs/authentication

---

## Summary

✅ **What's Done:**
- OAuth providers configured in auth system
- Social login buttons added to login and register pages
- Proper brand guidelines followed
- Callback URLs configured
- Security best practices implemented

⚠️ **What's Needed:**
- Create OAuth applications with each provider
- Add credentials to `.env.local`
- Test each OAuth flow
- Deploy with production credentials

🚀 **Once Complete:**
- Users can sign in with one click
- Faster registration process
- Better user experience
- Reduced password management burden

---

**Last Updated:** January 13, 2026  
**Next Review:** After OAuth credentials configured and tested
