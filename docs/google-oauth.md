# OAuth Provider Setup (Google, Facebook, Apple)

This document describes how to configure OAuth providers for self-service signup.

## Common Supabase Dashboard Steps

For each provider:

1. Go to **Authentication → Providers** in Supabase Dashboard.
2. Find the provider card and enable it.
3. Enter the required credentials (Client ID, Client Secret, etc.).

The app calls `supabase.auth.signInWithOAuth({ provider })` with no
provider-specific code — all configuration is done through Supabase Dashboard.

No OAuth secrets are stored in the app code. Each provider is configured
entirely through Supabase Dashboard + the provider's developer console.

## Supabase Redirect URLs (all providers)

Under **Authentication → URL Configuration**:

- **Site URL:** `https://gadget-zone-online-pos.vercel.app`
- **Redirect URLs:**
  - `https://gadget-zone-online-pos.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

Supabase callback URL (add this to each provider's allowed redirect URIs):
`https://bvxyxrdskjryepwjmsvc.supabase.co/auth/v1/callback`

---

## Google

### Supabase Dashboard
- Enable **Google** provider
- OAuth 2.0 Client ID + Client Secret

### Google Cloud Console
1. Go to https://console.cloud.google.com/apis/credentials
2. Create an OAuth 2.0 Client ID (Web application).
3. Add Authorized redirect URI:
   - `https://bvxyxrdskjryepwjmsvc.supabase.co/auth/v1/callback`
   - (local dev) `http://localhost:54321/auth/v1/callback`

---

## Facebook

### Supabase Dashboard
- Enable **Facebook** provider
- App ID + App Secret (from Meta Developer app)

### Meta Developer Console
1. Go to https://developers.facebook.com/apps/
2. Create or select an app.
3. Add **Facebook Login** product.
4. Under **Facebook Login → Settings**:
   - Valid OAuth Redirect URIs: `https://bvxyxrdskjryepwjmsvc.supabase.co/auth/v1/callback`
5. Under **App Review**:
   - Make the app public (or add test users).
6. Required permissions: `public_profile`, `email`
   - The Supabase Facebook provider automatically requests `email`.
   - Keep **Allow users without email** OFF in Supabase provider settings.

---

## Apple

### Requirements
- Apple Developer Program membership ($99/year)
- Team ID (from Apple Developer Membership page)
- App ID (registered in Certificates, Identifiers & Profiles)
- Services ID (a separate identifier for the sign-in service)
- .p8 private key file (one key, used for all your apps)
- Key ID (from the .p8 key creation page)

### Supabase Dashboard
- Enable **Apple** provider
- Enter:
  - **Client ID**: your Services ID (e.g., `com.example.pos.signin`)
  - **Team ID**: from Apple Developer Membership
  - **Key ID**: from the .p8 key page
  - **Private Key**: the full content of the .p8 file (including `-----BEGIN PRIVATE KEY-----`)

### Apple Developer Console
1. **Certificates, Identifiers & Profiles → Identifiers**
   - Register an **App ID** (e.g., `com.example.pos`)
   - Enable **Sign in with Apple** capability

2. **Register a Services ID** (e.g., `com.example.pos.signin`)
   - Configure **Sign in with Apple** for this Services ID
   - Set the **Return URL** to: `https://bvxyxrdskjryepwjmsvc.supabase.co/auth/v1/callback`

3. **Certificates, Identifiers & Profiles → Keys**
   - Register a new key
   - Enable **Sign in with Apple**
   - Associate with the App ID
   - Download the .p8 file (one-time download only!)
   - Note the **Key ID**

### Apple User Metadata
- Apple may not provide the user's full name on subsequent sign-ins.
- The onboarding wizard always asks for the owner name regardless of provider.
- Apple name data from the first sign-in is stored in `user_metadata` if available.

### Secret Rotation
- Apple .p8 private keys do not expire, but Apple recommends rotating keys periodically.
- Update the Private Key in Supabase Dashboard → Authentication → Providers → Apple.
- Supabase handles the client secret generation server-side.

---

## How OAuth Flow Works (all providers)

1. User clicks "Continue with [Provider]" on `/login`.
2. Server action calls `supabase.auth.signInWithOAuth({ provider })`.
3. Supabase redirects to the provider's consent screen.
4. On success, the provider redirects to Supabase callback URL, which
   exchanges the code for a session and forwards to `/auth/callback?next=%2Fdashboard`.
5. The `/auth/callback` route checks if the user has an organization:
   - No org / onboarding incomplete → `/onboarding`
   - Completed → `/dashboard`

## Important Notes

- **Apple** does not always return the user's full name. The onboarding
  wizard always asks for the owner name regardless.
- **Facebook** requires the `email` permission. Keep "Allow users without
  email" OFF in the Supabase Facebook provider settings.
- No OAuth secrets are hardcoded in the app. All provider configuration
  lives in Supabase Dashboard.
- The callback route (`/auth/callback`) is provider-agnostic — it works the
  same for Google, Facebook, Apple, and email confirmation links.
