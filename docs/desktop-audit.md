# Desktop App Read-Only Audit

## Sources Reviewed

- `/Users/sw12/Projects/GadgetZonePOS`
- `/Users/sw12/Projects/gadget-zone-pos-vercel`

These folders were inspected as read-only references. No files were edited there.

## Existing App Purpose

The desktop Gadget Zone POS is an offline shop management system for mobile retailers, repair counters, accessory sellers, and digital service providers. It handles billing, inventory, customers, credit ledger, repairs, expenses, reports, settings, backup/restore, and invoice/receipt output.

## Screens and Features

- Login and recovery code notice
- Dashboard
- New Bill
- Sales History
- Products
- Inventory
- Customers
- Customer Credit / Ledger
- Suppliers
- Repairs
- Reports
- Shift Close / Daily Closing
- User Management
- My Profile
- Settings
- Backup / Restore
- Factory Reset
- Permission denied / admin confirmation dialogs

## Entities, Tables, and Models Observed

The desktop app uses SQLite with C# models and a large `DatabaseService`. Important domain objects include:

- Users and roles
- Products, services, categories, suppliers
- Product stock lots and stock movements
- Bills and bill items
- Bill reviews
- Customers
- Customer ledger entries
- Credit payments
- Returns and refund lines
- Repairs and status history
- Expenses
- Daily closing records
- Staff shifts
- App settings
- Activity/audit logs
- Backups

## Invoice Logic

Invoices support products and services, item discounts, bill discounts, payment method, payment status, amount paid, customer credit applied, and balance due. After saving, the desktop app shows a confirmation flow with Open Invoice, Print Invoice, Share WhatsApp, and Close / Start New Bill.

## Product and Stock Logic

Products can be physical stock items or services. Physical stock uses purchase price, sale price, quantity, minimum stock, category, supplier, barcode, and warranty. Inventory supports add stock, manual adjustment, stock lots/batches, supplier linking, low stock checks, and stock movement audit records. Bill saving deducts stock and tracks batch usage.

## Customer Ledger and Credit Logic

Customers can owe money or hold advance credit. The desktop app tracks pending bill balances, manual ledger entries, credit/debit direction, credit payments, settlement behavior, and hides settled accounts from default pending views.

## Repair / Job Logic

Repairs track customer/device details, problem description, diagnosis, estimated cost, advance paid, final cost, status, notes, receipts, and label/sticker output. Common statuses include received, waiting for parts, in progress, completed, delivered, and cancelled.

## Expenses Logic

Expenses track category, amount, payment method, vendor, notes, creator, archive state, and dates. Expenses reduce net profit and appear in daily closing and reports.

## Daily Closing Logic

Daily closing summarizes bills, payment methods, refunds, expenses, credit pending, service commission, service cash in/out, expected cash, actual cash, and difference. It can produce A4 and 80mm summaries.

## Reports Logic

Reports include sales total, bill count, discounts, estimated profit, payment method totals, top selling items, low stock, staff sales, stock movements, activity logs, high-discount bills, cash summary, and operational alerts.

## Receipt, PDF, and Thermal Printing

The desktop app uses QuestPDF. It supports A4 invoices and 80mm thermal receipts. A4 and 80mm files can exist side by side. Service receipts separate principal handled from commission earned.

## Settings and Admin Behavior

Settings manage shop branding, phone/email/address, invoice logos, theme spacing/accent, backup folder, login branding, user passwords, backups, restore, and factory reset. Admin confirmation gates sensitive actions. User management protects the last admin / owner-style account.

## What Should Be Copied to Web

- Core POS billing flow
- Product/service distinction
- Service commission vs principal split
- Customer credit and ledger
- Repairs status workflow
- Expenses and daily closing
- Role-based permissions
- Audit logs
- A4 and 80mm receipt concepts

## What Should Change for Cloud/Web

- Replace local SQLite with Supabase Postgres.
- Replace local users/passwords with Supabase Auth.
- Add organization and branch scoping.
- Use Row Level Security instead of local admin checks alone.
- Replace local backup/restore with database backups and export tools.
- Make receipt generation server-side or edge-safe.
- Add multi-device concurrency protections.

## What Should Be Deferred

- Full receipt/PDF rendering
- Barcode scanner hardware integration
- Direct thermal printer drivers
- Advanced backup/restore UI
- Full returns/refunds workflow
- Deep staff shift reconciliation

