# Customer Settlement Accounting Parity

Implemented parity with the offline Gadget Zone POS v1.0.8/v1.0.9 customer settlement accounting behavior.

## What Was Already Present (Pre-existing)

- Customer outstanding balance tracking (`customers.outstanding_balance`)
- Double-entry customer ledger (`customer_ledger_entries` with invoice_credit, credit_payment, refund)
- Credit payment settlement table (`credit_payments`)
- Basic settlement RPC (`record_credit_payment`)
- Payment methods for settlements: cash, card, easypaisa, jazzcash, bank_transfer
- Customer detail page with ledger, settlement history, and invoice history tabs
- Basic daily closing with `expected_closing_cash`
- Reports with credit payments received section
- Dashboard with open balances
- RLS on all tables
- Audit logging on POS and daily closing

## What Was Added (Migration 0026)

### FIFO Allocation on Settlement Payments

When a customer pays old credit:
1. A `credit_payments` record is created (as before)
2. A ledger entry is created (as before)
3. The customer's `outstanding_balance` is reduced (as before)
4. **NEW**: The payment is allocated to the oldest unpaid/partial invoices first (FIFO order by `invoice_date`)
5. Each invoice's `amount_paid` increases, `balance_due` decreases, and `status` updates
6. Allocation stops when the payment amount is exhausted

### Credit Write-Offs

New table `customer_write_offs`:
- `id`, `organization_id`, `branch_id`, `customer_id`, `amount`, `reason`, `written_by`, `created_at`, `updated_at`
- RLS enabled, org-scoped
- Only `owner` or `admin` roles can write off
- A reason/note is required
- Written-off amount reduces `customers.outstanding_balance`
- A ledger entry of type `write_off` is created
- Write-offs appear in Reports/P&L as bad debt / credit write-off
- Write-offs do NOT increase cash or digital collection
- Write-offs do NOT count as revenue
- Each write-off is audit-logged

### Daily Closing Credit Collection Tracking

New columns on `daily_closings`:
- `credit_collection_cash` — cash settlements from credit customers today
- `credit_collection_digital` — digital settlements from credit customers today
- `credit_write_offs` — credit amounts written off today

**Expected cash formula** updated:
```
expectedCash = cash_payments - cash_refunds - cash_expenses + credit_collection_cash
```

**Expected digital** is implicitly included in the `digital_payments` stat (credit collections add to it).

### Reports/P&L Write-Off Line

- `ProfitSummaryReport` now includes `creditWriteOffs`
- `CustomerLedgerSummaryReport` now includes `creditWriteOffs`
- Estimated Net Profit = grossProfit - expenses - refunds - creditWriteOffs
- Reports page shows a "Credit Write-offs / Bad Debt" line in Profitability Summary
- Customer Outstanding Ledger section shows write-offs total

### Dashboard Credit Collection Card

- "Credit collected today" stat card shows cash + digital settlements

### Audit Logging

- `recordCreditPaymentAction` now logs `customer.credit_payment` audit event
- `recordWriteOffAction` logs `customer.write_off` audit event
- Revalidates `/daily-closing` and `/reports` paths in addition to existing paths

## No Double-Counting Principle

- A credit sale counts as sale/revenue at invoice creation time (via `pos_checkout`)
- Later collection (settlement) counts as receivable recovery, NOT new revenue
- Write-offs reduce net profit but do not increase cash/digital
- The P&L separates credit write-offs from operating expenses

## Permissions/RLS

- `customer_write_offs` is org-scoped with RLS policy
- `record_customer_write_off` RPC verifies `owner` or `admin` role
- `record_credit_payment` RPC requires authenticated user (existing)
- All existing RLS policies remain unchanged

## Settlement Rules

| Method | Effect on Daily Closing |
|--------|------------------------|
| Cash settlement | Increases `credit_collection_cash` + `expected_closing_cash` |
| Card/EasyPaisa/JazzCash/Bank transfer settlement | Increases `credit_collection_digital` + implicitly increases `digital_payments` area |

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/0026_customer_settlement_accounting.sql` | New migration: write-offs table, FIFO RPC, daily closing columns |
| `src/lib/validation/customers.ts` | Added `writeOffSchema` |
| `src/app/customers/actions.ts` | Added `recordWriteOffAction`, audit logging, revalidation |
| `src/app/customers/[id]/write-off-form.tsx` | New: write-off form component |
| `src/app/customers/[id]/page.tsx` | Added write-off form, write_off ledger type styling |
| `src/lib/data/daily-closing.ts` | Added `getCreditCollections`, updated `DayActivity`/`DailyClosingRow` types |
| `src/app/daily-closing/actions.ts` | Snapshots credit collection/write-off fields |
| `src/app/daily-closing/page.tsx` | Shows credit collection/write-off stat cards |
| `src/lib/data/reports.ts` | Fetches write-offs, updates profit/net calculations |
| `src/app/reports/page.tsx` | Shows write-offs in P&L and customer ledger section |
| `src/app/dashboard/page.tsx` | Shows "Credit collected today" card |
| `docs/customer-settlement-accounting.md` | This file |

## QA Checklist

- [ ] Create credit sale — confirm outstanding increases
- [ ] Record cash settlement — confirm outstanding decreases, oldest bill paid first
- [ ] Daily closing shows credit_collection_cash, expected cash includes it
- [ ] Record digital settlement — credit_collection_digital increases
- [ ] Write off remaining balance as admin — outstanding decreases, write-off appears in reports
- [ ] Write-off does NOT increase cash/digital
- [ ] Dashboard shows credit collected today
- [ ] Tenant isolation preserved
- [ ] Owner/admin permission enforced for write-offs
- [ ] Audit log entries created
- [ ] Lint/typecheck/build pass
