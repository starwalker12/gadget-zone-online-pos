# Current Production State

## Production Configuration
* **Current production main SHA:** `8da11bab7f8b69421ace876976c13975c72de811`
* **Immediate previous safe rollback point:** `13fcaaf116f3a888190eb719a0ec5c50b6adfa06`
* **Live URLs:**
  * https://saledock.site
  * https://saledock-cloud-pos.vercel.app
* **Hosting:** Vercel (main auto-deploys to production)
* **Database & Auth:** Supabase
* **Currency/Timezone:** PKR / Asia-Karachi

## Latest Completed Work
1. **Mobile Dashboard:** Much improved, fully responsive, and live.
2. **Mobile POS:** Product grid is optimized and responsive.
3. **Compacted Mobile Pages:** Polish and layout compaction completed for settings, catalog/products, customers, invoices, reports, expenses, cash drawer, supplier purchases, supplier dues, replenishment, repairs, audit log, and users.
4. **UX Improvements:** Required field cues and empty state displays have been optimized.
5. **Mobile Navigation Drawer:** Solved theme selector dropdown issues and page margins/padding overflow.
6. **Customizable Bottom Tab Bar:** Polish added to customize view supporting selection of 4 to 6 tabs, ordering, and quick reset/save.
7. **Bottom Tab Customize Screen:** Rendered within a React Portal to escape the topbar's stacking context, ensuring that the Save and Reset buttons are fully visible and clickable above the bottom tab bar.
8. **Cookie / Analytics Consent Banner:** Consent is tracked per device (for logged-out pages) and synced to database user preferences (for logged-in accounts). It asks only once per account/device and does not flash on loading screens.
9. **Invoice Logo Settings:** Hidden the technical raw Supabase URL field from invoice branding settings UI, replacing it with a clean upload success notice.
10. **Plain-Text WhatsApp Invoice Sharing:** Primary WhatsApp share action builds a plain-text invoice message and launches WhatsApp directly.
11. **Secondary PDF/Image Options:** Kept manual modal secondary actions intact (Download Image PNG, Download/Print PDF, A4 print, and 80mm print).
12. **reCAPTCHA Audit:** Standard reCAPTCHA v2 checkbox on login was kept untouched.
13. **Archived Nav Persistence:** Fixed archived sidebar list items where clicks would navigate incorrectly.
14. **Reports Reconciliation Guide:** Added a detailed walkthrough explanation on the reports page detailing the relationship between Gross Sales, Discounts, Net Sales, Returns, Cost of Goods Sold (COGS), and Net Profit.
15. **E2E Playwright Smoke-Test Foundation:** Setup serially-executed (`workers: 1`) Playwright E2E tests for core navigation, POS checkouts, invoice redirection, returns, and reports guides. Built a strict production-mutation guard that skips POS checkouts/returns on live production base URLs unless `PLAYWRIGHT_ALLOW_PRODUCTION_MUTATIONS=true` is explicitly set.

## Safety & Business Rules
* **No Database Migrations or SQL:** No schemas or database table modifications have been made.
* **No Core Calculation Changes:** Unaltered pos_checkout, checkout/payment math, invoice totals/dues/payments, customer balance/ledger, supplier due, daily cash drawer, and report calculations.
* **No Auth/Session changes:** Kept Supabase authentication, session providers, and client login logic completely untouched.
* **No Backend Server Mutations:** Kept backend mutation endpoints and server action behavior unchanged.
* **Secure Invoice Sharing:** Invoice image/PDF sharing uses already-loaded client-side invoice data only, and does not expose private invoices via public urls.
* **No Dashboard Caching:** No caching layer added for dashboard/money reports.
* **Secure Test Credentials:** E2E test login credentials are never saved in code or files and are loaded dynamically from environment variables during runtime.

## Current Known Issues & Notes
* **reCAPTCHA Enterprise Key Email:** Google may continue to send emails about the unused key. The owner (Fardan) should manually delete or disable this key in his Google Cloud Console. Full integration of reCAPTCHA Enterprise would be a separate, auth-sensitive, review-first task.

## Recommended Next Steps
1. **Review and Merge E2E Test Expansion:** Review and merge the expanded smoke tests (covering customers, products, expenses, suppliers, settings, permissions, and cash drawer routes).
2. **Review QA Test Runs:** Run E2E test runs using local env vars on localhost or staging to verify complete system behavior.
