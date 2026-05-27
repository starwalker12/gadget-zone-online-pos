# Security Input Hardening

This document describes SaleDock Cloud POS's approach to input validation,
XSS prevention, and SQL injection protection.

## XSS Prevention

### Rules

1. **No `dangerouslySetInnerHTML` for user data.** The only usages in the
   codebase are for static CSS print styles (`repairs/[id]/page.tsx`,
   `reports/page.tsx`) — these are safe because they contain no user data.

2. **React text rendering escapes HTML automatically.** All user-supplied
   text passed as `{variable}` in JSX is safely escaped by React. Sanitization
   helpers strip control characters and enforce length limits as defense in
   depth.

3. **URLs must be validated before rendering as links.** Use `validateSafeUrl()`
   or the appropriate platform-specific validator. Never render `href` from
   unsanitized user input.

4. **External links must use `rel="noopener noreferrer"`.**

### Sanitization Helpers (`src/lib/security/sanitize.ts`)

| Function | Purpose |
|---|---|
| `sanitizePlainText(value, maxLength)` | Strip control chars, truncate, trim |
| `sanitizeNullableText(value, maxLength)` | Same but returns null if empty |
| `validateSafeUrl(value, allowedProtocols)` | Allow only http/https URLs |
| `validateImageUrl(value)` | Allow http/https or absolute internal paths |
| `normalizePhone(value)` | Strip non-digit chars, allow leading + |
| `normalizeUsername(value)` | Allow only alphanumeric, underscore, dot, hyphen |
| `validateGoogleMapsUrl(value)` | Accept valid Maps URLs or lat/lng pairs |
| `normalizeSocialLink(platform, value)` | Validate against known platform URL/handle patterns |
| `isSafeRedirectPath(value)` | Relative path check, prevent open redirect |
| `escapeLike(value)` | Escape `%` and `_` for safe LIKE patterns |

### URL Allowlist

- **General URLs**: `https:`, `http:` only. `javascript:`, `data:`, `vbscript:`,
  `file:` are rejected.
- **Image URLs**: Absolute internal paths (`/...`) or http/https.
- **Google Maps URLs**: Only these hosts accepted:
  - `maps.google.com`
  - `www.google.com/maps`
  - `goo.gl/maps`
  - `maps.app.goo.gl`
  - Plain lat/lng strings (e.g., `24.8607,67.0011`)
- **Social Links**: Per-platform regex validation:
  - Facebook, Instagram, Twitter/X: URL or `@handle`
  - LinkedIn, YouTube, WhatsApp, TikTok: URL only

### Map Embed Rules

- Never embed arbitrary iframe HTML from user input.
- Only build embed/link from validated Google Maps URL or lat/lng.
- If validation fails, show as external text link only.

## SQL Injection Prevention

### Codebase Status

The codebase exclusively uses the Supabase JavaScript client (PostgREST), which
parameterizes all query values. **No raw SQL string concatenation** was found.

### Enforced Patterns

1. **All database queries use the Supabase query builder** (`supabase.from(...)`,
   `.select()`, `.insert()`, `.update()`, `.upsert()`, `.delete()`).
2. **All RPC calls pass structured parameters** through the client — values are
   Zod-validated or sanitized before reaching the database.
3. **No `pg`/`postgres`/`sql` tagged templates** are used anywhere in `src/`.
4. **No dynamic `EXECUTE`** in PL/pgSQL functions in migrations.
5. **`order()` calls use hardcoded column names** — never user-controlled.
6. **LIKE/ILIKE patterns** use `escapeLike()` to prevent wildcard injection
   (`%` and `_` are escaped).

### Safe Search Pattern

```ts
import { escapeLike } from "@/lib/security/sanitize";

const term = `%${escapeLike(userInput)}%`;
query = query.or(`name.ilike.${term}`);
```

### Safe Redirect Pattern

```ts
import { isSafeRedirectPath } from "@/lib/security/sanitize";

if (next && isSafeRedirectPath(next)) {
  redirect(`${origin}${next}`);
}
```

## Review Checklist for New Code

- [ ] No `dangerouslySetInnerHTML` with user data
- [ ] User text rendered via React `{}` (auto-escaped)
- [ ] URLs validated before use in `href` or `src`
- [ ] External links have `rel="noopener noreferrer"`
- [ ] Google Maps URLs validated with `validateGoogleMapsUrl()`
- [ ] Social links validated with `normalizeSocialLink()`
- [ ] LIKE patterns use `escapeLike()`
- [ ] RPC parameters are Zod-validated or sanitized
- [ ] No raw SQL string concatenation
- [ ] Order/column names are hardcoded, not user-controlled
