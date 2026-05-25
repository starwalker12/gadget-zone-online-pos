# Business Rules

## Invoices

- Invoice numbers must be unique per organization.
- A bill can be draft, paid, partial, unpaid, or void.
- Grand total equals subtotal minus discounts.
- Balance due equals grand total minus amount paid minus customer credit applied.
- Partial payment creates a customer balance.
- A saved invoice should create audit records.

## Products and Stock

- Physical products have purchase price, sale price, current stock, minimum stock, category, and optional supplier.
- Services do not carry stock.
- Stock cannot go below zero.
- Low-stock alerts compare stock quantity to minimum stock.
- Future stock batch support should preserve FIFO cost behavior from the desktop app.

## Services

- Service transactions may have principal handled and commission earned.
- Principal handled is not profit.
- Commission earned is shop income.
- Service receipts must show principal and commission separately where relevant.

## Customer Ledger

- Customer debt comes from unpaid or partial invoices plus manual receivable entries.
- Customer credit comes from manual credit entries or advance payments.
- Net balance equals receivable minus credit.
- Settled accounts should not appear in the default pending list.

## Repairs

- Repairs need job number, customer details, device information, problem, status, cost, advance paid, and notes.
- Every status change should create a status history record.
- Delivered and cancelled repairs should be treated as terminal states unless reopened by an admin.

## Expenses

- Expenses reduce net profit.
- Expenses can be archived instead of deleted.
- Expense edits and archive actions should be audited.

## Daily Closing

- Daily closing should be unique per organization, branch, and date.
- It summarizes cash sales, digital payments, credit pending, refunds, expenses, service commission, service cash in/out, expected cash, actual cash, and difference.

## Permissions

- Owner/admin can manage settings, staff, sensitive deletes, and daily closing corrections.
- Manager can supervise operations and reports.
- Cashier can create invoices and payments.
- Technician can work repairs.
- RLS must scope data by organization.

