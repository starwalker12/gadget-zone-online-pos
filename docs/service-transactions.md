# Service Transactions

The offline app distinguishes mobile load, EasyPaisa, JazzCash, bank transfer, and bill payment from regular product sales. This module brings that distinction online.

## The core rule (never regress)

**Principal is pass-through. Commission is profit.**

> Example — EasyPaisa Cash In, customer hands over Rs. 500 cash, shop sends Rs. 500 online, charges Rs. 50 commission:
>
> - Principal handled: Rs. 500 (pass-through, not income, not profit)
> - Commission earned: Rs. 50 (shop income, profit)
> - Total charged: Rs. 550 (what the customer sees)

The whole system protects this: the `pos_checkout` Postgres function stores principal, commission, and total-charged separately on each `invoice_items` row. Reports add **commission** to profit and surface **principal handled** in a separate "pass-through" line.

## Where service metadata lives

`invoice_items` already has these columns (since migration 0001):

- `service_provider` — e.g. "EasyPaisa", "Jazz", "Telenor"
- `service_direction` — `cash_in` / `cash_out` / `send` / `receive` / `transfer` / `bill_payment` / `mobile_load` / `other`
- `service_account_number` — sender / customer account
- `service_receiver_account` — receiver account
- `service_reference_no` — transaction reference (TID)
- `service_transaction_amount` — **principal** (pass-through)
- `service_commission` — **commission** (shop income)
- `service_total_charged` — total customer was charged (principal + commission)
- `service_note` — free-form note

Catalog products also drive defaults via:

- `service_type` (used as default direction)
- `default_commission_amount`
- `requires_account_number`, `requires_provider`, `requires_reference`

## What changed in this milestone

### Migration 0011_service_transactions_snapshot.sql

Replaces `public.pos_checkout` (same signature, security invoker, RLS unchanged) so it:

- Reads optional `service_*` keys from each JSON cart entry.
- Validates `principal >= 0`, `commission >= 0`, `total_charged >= commission`.
- Defaults `total_charged = principal + commission` when not provided.
- Snapshots all eight `service_*` fields into the inserted `invoice_items` row when the product is a service.

All existing logic — FIFO lot allocation, loss prevention, invoice numbering, customer ledger, payment row, walk-in fully-paid rule — is preserved verbatim. Existing invoices and existing checkout calls without service fields continue to work exactly as before.

### Validation (`src/lib/validation/pos.ts`)

`cartItemSchema` now accepts the optional service fields, with `superRefine` enforcing `total_charged >= commission` and `principal >= 0` client-side too (defense in depth — the RPC re-validates).

### POS UI (`src/app/pos/pos-client.tsx`)

When a cart line is a service, a "Service details" expandable panel appears under that line with:

- Provider (text — required marker if `requires_provider`)
- Direction / type (select — defaults from `service_type` on the catalog row)
- Sender / account # (required marker if `requires_account_number`)
- Receiver account #
- Reference # (required marker if `requires_reference`)
- Principal (pass-through)
- Commission (shop income — pre-fills from `default_commission_amount`)
- Total charged (auto-suggested as principal + commission if blank)
- Note

The cart line total above the panel (unit price × qty − discount) is still what appears on the invoice. The new fields are stored as **metadata** so reports can compute the correct profit/principal split.

### Reports (`src/lib/data/reports.ts` + `src/app/reports/page.tsx`)

New section **Service Transactions**:

- 4 KPI cards: Transactions, Commission earned, Principal handled, Total charged.
- **By Provider** table: count, principal, commission per provider.
- **By Direction / Type** table: count, principal, commission per direction.
- Principal handled is clearly labelled "pass-through (NOT profit)".

The existing **Profitability Summary** already adds `serviceProfit` (commission) to gross sales and shows `servicePrincipalHandled` as a non-profit pass-through line; that math is preserved.

### Invoice / 80mm receipt (already in place from PR #21)

When `service_*` fields are populated, both A4 and 80mm layouts show Principal and Commission below the service line item. **Principal is never labelled as profit.**

## How profit is calculated for a service line

`reports.serviceProfit = sum_over_service_items( service_commission > 0 ? service_commission : line_total )`.

In other words: prefer the explicit `service_commission` snapshot; if it's 0 (older invoices, simple services), fall back to `line_total` (which equals commission only when `purchase_price = 0`, which the catalog code enforces for services).

Principal **never** enters profit math.

## Stock & loss prevention

Services are unaffected by stock and loss prevention. `pos_checkout` still takes the same shape for them: no lot allocation, no stock decrement, no below-cost check.

## Not in scope for this milestone

- Service deposit / advance flow.
- Multi-direction reconciliation (e.g. daily JazzCash float report).
- Provider settlement statements / float top-ups.
- Reverse / refund of service transactions through the returns module.
- Bulk service entry (today services are entered one cart line at a time).
