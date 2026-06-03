<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-summary -->
# Session Summary — Mobile Navigation Drawer

## Goal
Replace the cramped horizontal-scrolling mobile nav with a hamburger button + slide-out drawer showing the full permission-gated nav, while keeping desktop sidebar unchanged.

## Context
- Repo: gadget-zone-online-pos (Next.js 16, Supabase, Prisma)
- Production: https://saledock.site
- Owner is non-technical — use draft PRs and let them review on live/preview site.
- Never modify checkout, stock, money, reports logic, data fetching, DB schemas, or migrations.
- PRs #108, #109, #110, #111 are all merged. Facebook removal is done. Captcha renders as small text (no grey box).

## What Was Done

### Files Created
- `src/components/layout/drawer-context.tsx` — React context (`DrawerProvider`/`useDrawer`) for drawer open state shared between hamburger (inside topbar) and drawer panel (at app-shell level).
- `src/components/layout/mobile-drawer.tsx` — Client component rendering both the hamburger button (<lg) and the full-screen slide-out drawer with nav items, settings sub-pages (Accounts/Privacy/Security), active route highlighting, close on X/backdrop/Esc/link-tap, body scroll lock.
- `src/components/layout/mobile-drawer-wrapper.tsx` — Server component that computes permission-gated nav items (same logic as sidebar) and passes them to `<MobileDrawer>`.

### Files Modified
- `src/components/layout/app-shell.tsx` — Wrapped with `<DrawerProvider>`, removed `<MobileNav>` + hardcoded `mobileLinks` array entirely.
- `src/components/layout/topbar.tsx` — Added `<MobileDrawerWrapper />` (hamburger) before page title in a flex row (visible only <lg).
- `src/components/layout/sidebar-nav.tsx` — Added `labelFallback` map so `supplierDues` renders as "Supplier Dues" instead of the raw key when translation is missing.
- `src/lib/i18n/translations.ts` — Added `dues: "Supplier Dues"` (and Urdu equivalent) to the `sidebar` section in all three language blocks.

### Files Deleted
- `src/components/layout/mobile-nav.tsx` — Replaced by the drawer.

### Verifications
- `npm run lint` — 0 errors, only 2 pre-existing warnings (unrelated).
- `npm run typecheck` — passes.
- `npm run build` — passes (all routes compile, no dead imports).

## Remaining (Minor)
- The `mobile-drawer.tsx` has a "Menu" hardcoded label in the drawer header — consider making it translatable if multilingual support is needed for the drawer itself.
- Verify on mobile viewport that hamburger appears and drawer opens/closes correctly. Owner should review on live/preview site before merge.
<!-- END:session-summary -->
