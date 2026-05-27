# OWASP Top 10 Security Review — SaleDock Cloud POS

**Date:** May 2026
**Scope:** Full-stack web application (Next.js, Supabase, PostgreSQL)
**Repository:** `gadget-zone-online-pos`

---

## A01: Broken Access Control

### Current Risk: Medium

The app uses multi-layered access control but has gaps discovered during audit.

### Existing Protections

1. **Route protection (`src/proxy.ts`):** Unauthenticated users are redirected to `/login` for all
   protected prefixes (`/dashboard`, `/pos`, `/products`, etc.).
2. **Role-based authorization (`src/lib/permissions.ts`):** Per-function role checks (`owner`, `admin`,
   `manager`, `cashier`, `technician`) enforced in server components and server actions.
3. **Platform admin isolation (`src/lib/platform/admin.ts`):** Separate `getPlatformAdmin()` /
   `requirePlatformAdmin()` functions; platform UI returns `notFound()` for non-admins.
4. **Organization ID scoping:** Every data query filters `.eq("organization_id", organizationId)`,
   preventing cross-tenant data access.

### Fixes Added in This PR

- **signUpAction** now enforces `public_signup_enabled` server-side (was client-only).

### Remaining Follow-Ups

- Organization ID scoping is manual — no automated middleware enforces it; relies on developer discipline.
- No CSRF tokens on server actions — mitigated by SameSite=Lax cookies, but not a defense-in-depth.
- Factory reset RPC now fixed (see A03).
- Consider adding automated tests for tenant isolation.

---

## A02: Cryptographic Failures

### Current Risk: Low

### Existing Protections

1. **No OAuth client secrets committed** — only stubs in `.env.example`.
2. **Supabase service role key** is in `.env.local` (ignored by git) and protected by `"server-only"`.
3. **No password hashes** stored locally — all auth handled by Supabase Auth (bcrypt).
4. **No auth users created from offline/desktop imports** — import process only restores business data.
5. **Secrets never printed in logs** — no `console.log` or error message exposes `SUPABASE_SERVICE_ROLE_KEY`.
6. **HTTPS enforced** by Vercel production and preview deployments.

### Fixes Added in This PR

- None needed — existing protections are adequate.

### Remaining Follow-Ups

- Consider adding `Strict-Transport-Security` header (already handled by Vercel edge).
- Consider rotating service role key periodically.

---

## A03: Injection

### Current Risk: Low (was Medium — fixed in this PR)

### Existing Protections

1. **No raw SQL string concatenation** — all queries use the Supabase JavaScript client (PostgREST).
2. **No `dangerouslySetInnerHTML` for user data** — React auto-escapes rendered text.
3. **Zod schema validation** on all server action inputs.

### Fixes Added in This PR

1. **Sanitization library (`src/lib/security/sanitize.ts`):** 11 helper functions covering:
   - Plain text sanitization (strip control chars, truncate, trim)
   - URL validation (allow only `http:` / `https:`)
   - Image URL validation
   - Phone normalization
   - Username normalization (alphanumeric + underscore/dot/hyphen)
   - Google Maps URL validation
   - Social link per-platform regex validation
   - Safe redirect path checking
   - LIKE escape for `%` and `_`
2. **XSS hardening applied to all server actions:**
   - `(auth)/actions.ts` — signUp `full_name` sanitized
   - `onboarding/actions.ts` — all text/URL/phone values sanitized before RPC
   - `settings/actions.ts` — shop name, phone, address, logo URL, invoice footer, receipt terms, colors
   - `platform/actions.ts` — string values sanitized before saving
3. **`escapeLike()` applied to 6 search files** — prevents wildcard injection in ILIKE patterns.
4. **No executable code from backup imports** — import only processes structured JSON data.
5. **No arbitrary iframe HTML from user input** — map embeds are built from validated URLs only.
6. **Reject `javascript:`, `data:`, `vbscript:`, `file:`** in URL inputs.
7. **Factory reset RPC hardened** — see following item.

### Factory Reset RPC Injection Fix (Critical)

- **Migration 0021:** `reset_organization_to_factory_defaults` was `security definer` without
  `set search_path` — potential privilege escalation vector.
- **Fix:** Added `set search_path = public` and `auth.uid()` check inside function body.
- **Fix:** Added explicit `REVOKE EXECUTE ON FUNCTION ... FROM public, anon` and
  `GRANT EXECUTE ... TO authenticated, service_role`.

### Remaining Follow-Ups

- Ensure all future RPCs use `set search_path` when `security definer`.
- Ensure all future RPCs have explicit `REVOKE`/`GRANT` execute statements.
- Consider adding a static analysis check for `security definer` without `set search_path`.

---

## A04: Insecure Design

### Current Risk: Low

### Architecture Review

- **Multi-tenant SaaS:** Shared database with `organization_id` column and RLS for tenant isolation.
- **Platform admin vs. tenant admin:** Separate permission levels — platform admin cannot access tenant
  business data through normal app flows.
- **Onboarding:** `complete_self_signup()` RPC checks `auth.uid()` and prevents duplicate organization
  creation for existing users.
- **Staff invite:** Only creates a profile in the existing organization — does not create a new shop.
- **Factory reset:** Organization-scoped (scoped by `p_organization_id`), now further gated by
  `auth.uid()` check and proper execute grants.
- **Backup import:** Organization-scoped and gated by authentication + `canManageSettings` permission.

### Fixes Added in This PR

- Factory reset RPC hardened (see A03).

### Remaining Follow-Ups

- Add rate limiting / CAPTCHA on sign-up and password reset endpoints.
- Add MFA (optional) for platform admin accounts.
- Consider automated tenant isolation testing.
- Consider input size limits on backup import files.

---

## A05: Security Misconfiguration

### Current Risk: Low

### Audit Findings

1. **Supabase RLS enabled** on all application tables and platform tables.
2. **RPC execute grants** — mostly correct with migration 0012 (`REVOKE` from public/anon for 5
   app RPCs). Factory reset RPC was missing grants — fixed in this PR (migration 0021).
3. **Security definer functions** — most use `set search_path = public` and check `auth.uid()`.
4. **Production redirect URLs** expected to be configured in Supabase Dashboard (no code change needed).
5. **Facebook provider** not configured — fails gracefully with user-friendly message.
6. **Supabase Storage** buckets not configured — no open bucket risk.
7. **No secrets leaked in error messages** — error responses are user-facing strings, not stack traces.
8. **HTTP security headers** — Vercel handles HSTS at the edge; app does not set custom CSP yet.

### Fixes Added in This PR

- Factory reset RPC execute grants fixed (migration 0021).

### Remaining Follow-Ups

- Add `Content-Security-Policy` header (recommended baseline).
- Configure Facebook OAuth provider in Supabase Dashboard if needed.
- Configure Supabase Storage bucket policies when image upload is implemented.
- Document production redirect URLs in Supabase Dashboard settings.

---

## A06: Vulnerable and Outdated Components

### Current Risk: Low

### npm Audit Result

```
2 moderate severity vulnerabilities
- postcss (via next) — XSS via unescaped </style> in CSS stringify output
- next@16.2.6 transitively depends on postcss < 8.5.10
```

### Assessment

- Both vulnerabilities are **moderate severity** and affect `postcss` through Next.js dependency chain.
- The fix requires `npm audit fix --force` which would downgrade Next.js to v9.x — **not acceptable**.
- The XSS vector is in CSS stringify output, not in application code paths.
- Safe to defer until Next.js publishes an updated version that pins `postcss >= 8.5.10`.

### Fixes Added in This PR

- None (deferred — breaking change).

### Remaining Follow-Ups

- Monitor Next.js releases for a version that includes the patched postcss.
- Run `npm audit` regularly in CI.

---

## A07: Identification and Authentication Failures

### Current Risk: Low

### Audit Findings

1. **Login/signup flow:** Standard email/password with Zod validation (min 8 char password).
2. **Forgot password:** Uses Supabase `resetPasswordForEmail` — secure by design.
3. **OAuth callback:** Validates `safeRedirect()` to prevent open redirects.
4. **Signed-in user recovery:** Users at `/login` see a status card with "Continue setup" /
   "Go to dashboard" / "Sign out" — no redirect trap.
5. **Platform admin:** Enforced by DB record `platform_admins` + env fallback
   (`PLATFORM_ADMIN_EMAILS`). Env fallback is intentional for development.
6. **`public_signup_enabled`:** Now enforced server-side (fix from this PR).
7. **Allow users without email:** Should be OFF in Supabase Dashboard (standard practice).

### Fixes Added in This PR

- `signUpAction` now rejects sign-ups when `public_signup_enabled` is disabled.
- `/login` page: signed-in users are no longer forced to redirect — they choose their path.

### Remaining Follow-Ups

- Enable MFA for platform admin accounts (Supabase supports this).
- Add CAPTCHA/rate limiting on sign-up and password reset endpoints.
- Document that "Allow users without email" must be disabled in Supabase Dashboard.
- Consider email confirmation enforcement for public sign-ups.

---

## A08: Software and Data Integrity Failures

### Current Risk: Low

### Audit Findings

1. **CI checks:** Local QA (lint, typecheck, build) runs before deployment. Vercel build verifies
   production readiness.
2. **Migrations tracked in git:** All 21 migrations are version-controlled in `supabase/migrations/`.
3. **No untracked schema changes:** All changes go through migration files.
4. **Backup import:** Processes structured JSON only — no executable code.
5. **No remote script injection from user URLs:** URLs are validated and rendered as links/images,
   not fetched server-side (see A10).
6. **Map embed:** Built from validated Google Maps URL or lat/lng — no arbitrary iframe snippets.

### Fixes Added in This PR

- Migration 0021 hardens the factory reset RPC (integrity of the function itself).

### Remaining Follow-Ups

- Consider signed release checksums for desktop/offline backups if needed.
- Consider adding CI security checks (e.g., `npm audit` in CI pipeline).
- Consider branch protection rules on `main`.

---

## A09: Security Logging and Monitoring Failures

### Current Risk: Low

### Audit Findings

1. **Platform settings updates:** Audited via `audit_logs` table with old/new values.
2. **Factory reset attempts:** Audited via `audit_logs` with actor ID and timestamp.
3. **Backup import:** Start/complete/failure events are audited.
4. **Onboarding completed:** Audited.
5. **Loss prevention events:** Audited.
6. **Error messages:** User-facing errors do not expose secrets or stack traces.
7. **Sign-in failures:** Supabase Auth tracks failed login attempts (Supabase Dashboard).

### Fixes Added in This PR

- Factory reset RPC audit log already existed — now better gated by authentication.

### Remaining Follow-Ups

- Add alerting for platform settings changes (e.g., Slack/email notification).
- Add alerting for factory reset operations.
- Add alerting for repeated failed login attempts (if Supabase webhook available).
- Consider a security events dashboard section in the platform console.

---

## A10: Server-Side Request Forgery (SSRF)

### Current Risk: Low

### Audit Findings

The application **does not fetch user-provided URLs server-side**. All user-entered URLs are
stored in the database and rendered by the browser:

1. **Logo URL (`settings/actions.ts`):** Validated via `validateImageUrl()` — stored as string,
   rendered by browser `<img>` tag. Server does not fetch it.
2. **Profile picture URL:** Rendered by browser. Not server-fetched.
3. **Google Maps URL:** Validated via `validateGoogleMapsUrl()` — rendered as link or embedded
   via validated URL construction. Not server-fetched.
4. **Social links:** Validated via `normalizeSocialLink()` — rendered as `<a>` links.
5. **Backup import:** User uploads a file via browser — no URL-based import exists.
6. **Webhooks/API integrations:** None exist yet.

### Rules

- User URLs may be stored/displayed as links or images in the browser.
- Server must **never** fetch arbitrary user-provided URLs.
- If server-side fetching is added later (e.g., webhooks), enforce:
  - Allowlist of allowed hosts
  - Block private IPs, localhost, and cloud metadata addresses
  - Timeout limits
  - No redirect following to internal hosts

### Fixes Added in This PR

- All URL inputs now validated through sanitization helpers.

### Remaining Follow-Ups

- If webhook or integration features are added, conduct a dedicated SSRF review.
- Consider adding a `fetch` wrapper that blocks private IPs for any server-side HTTP calls.

---

## Summary

| OWASP Category | Risk Level | Key Fixes in This PR | Follow-Ups |
|---------------|------------|---------------------|------------|
| A01 Access Control | Medium | `public_signup_enabled` server-side enforcement | CSRF tokens, tenant isolation tests |
| A02 Crypto Failures | Low | None needed | Key rotation policy |
| A03 Injection | **Medium→Low** | Sanitization lib, `escapeLike()`, XSS hardening, factory reset RPC hardening | RPC static analysis |
| A04 Insecure Design | Low | Factory reset RPC hardening | Rate limiting, MFA |
| A05 Misconfiguration | Low | Factory reset RPC grants | CSP headers, Storage policies |
| A06 Outdated Components | Low | None (deferred) | Monitor Next.js updates |
| A07 Auth Failures | Low | `public_signup_enabled` enforcement, login redirect fix | MFA, CAPTCHA |
| A08 Integrity Failures | Low | Migration 0021 | CI security checks |
| A09 Logging/Monitoring | Low | None needed | Alerting for critical events |
| A10 SSRF | Low | URL validation helpers | Webhook SSRF review |

**Overall post-PR risk level: LOW** (was MEDIUM for A03, now resolved).
