# POS Checkout

The cashier flow lives at `/pos`. Invoices land at `/invoices` (list) and `/invoices/[id]` (printable detail).

## Atomic checkout

`supabase/migrations/0003_pos_checkout.sql` adds a Postgres function `public.pos_checkout(...)` that runs the entire sale in a single transaction:

1. Verifies authenticated user has an active profile.
2. Locks the organization row to serialize invoice-number generation.
3. Generates a sequential invoice number `INV-NNNNNN`.
4. Re-fetches each product `FOR UPDATE`, validates active state and stock for physical items.
5. Recomputes line totals and subtotal **server-side** (the browser is never trusted).
6. Computes `grand_total`, `amount_paid`, `balance_due`, and the status (`paid` / `partial` / `unpaid`).
7. Inserts the invoice, invoice items, and (if `amount_paid > 0`) a payment row.
8. Decrements stock for `type = 'product'` items only.
9. Returns `(invoice_id, invoice_no)`.

`security invoker` keeps RLS active; only org members can call it successfully, and inserts respect the existing org-scoped policies.

## Validation

`src/lib/validation/pos.ts` exposes:

- `cartItemSchema` — per-line: product_id, quantity, unit_price, discount
- `checkoutSchema` — full cart + customer + discount + payment method + amount paid + reference + note
- `quickCustomerSchema` — name (required), phone (optional)

Payment methods: `cash`, `card`, `easypaisa`, `jazzcash`, `bank_transfer`, `customer_credit`.

## Permissions

`canUsePos(role)` allows `owner`, `admin`, `manager`, `cashier`. Server actions reject everyone else and the UI disables the checkout button for those roles.

## Server actions

`src/app/pos/actions.ts`:

- `checkoutAction(input)` — validates, calls `pos_checkout` RPC, revalidates `/pos`, `/invoices`, `/dashboard`, `/products`.
- `quickCreateCustomerAction({ name, phone })` — quick walk-in customer creation.

## UI

`src/app/pos/pos-client.tsx` (client component) holds the cart state:

- Product grid filtered by search (name/SKU/barcode) + category.
- Out-of-stock items are disabled; low-stock items show a badge.
- Cart: per-line quantity (+/−), editable unit price, line discount, remove.
- Customer dropdown with quick-add inline form.
- Cart-level discount.
- Payment method select, amount paid (with "Exact" helper that fills the grand total), optional reference for non-cash methods, optional note.
- Live subtotal / cart discount / grand total / balance due.
- On success: in-line confirmation with a link to the new invoice.

Layout: products + cart side by side on `xl:` screens, stacked on smaller.

## Invoices

- `src/app/invoices/page.tsx` — responsive list (desktop table / mobile card list).
- `src/app/invoices/[id]/page.tsx` — printable detail with business header, customer, line items, totals, payments, and note.
- `src/app/invoices/[id]/print-button.tsx` — client button that calls `window.print()`.
- Print CSS is in `src/app/globals.css` (`@media print`) — strips chrome, prints just the invoice. No paid PDF service.

## Dashboard

- New cards: Invoices total, Open balances (partial + unpaid), Customers, Repairs.
- "Today sales" card now reads from `invoiceCounts()` (sum of grand totals for invoices dated today, plus invoice count).

## Page titles

`AppShell` now accepts a `pageTitle` prop. Each page sets a friendly title (Dashboard, Catalog, New sale, Invoices, Customers, Repairs, Reports, Settings).

## What's intentionally NOT in this milestone

- Per-payment receipts beyond the invoice view.
- Refund / void invoice flow.
- Customer ledger / running balance.
- Daily closing / Z-reports.
- Repairs workflow.
- Server-rendered PDF.

## How to start using POS

If the catalog is empty, add at least one product in **Catalog** first. Then go to **New sale** and tap a product to add it to the cart.
