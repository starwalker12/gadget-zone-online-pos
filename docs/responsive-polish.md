# Mobile-first responsive polish

This pass improves the authenticated Gadget Zone Online POS layout across phone, tablet, and desktop sizes without changing database schema, seed data, print receipts, or print invoices.

## What changed

- App shell: the mobile navigation now uses a horizontally scrollable active-state menu, and the topbar truncates organization, branch, user, email, and search content safely.
- POS: phones and tablets use Products and Cart tabs below `xl`, with a sticky cart action on the Products tab when items exist. Desktop keeps the side-by-side POS layout.
- Products: category and supplier tables become mobile cards below `md`, while product filters and forms stack cleanly.
- Route polish: login, dashboard, products, customers, customer detail, POS, invoices, invoice detail, returns, expenses, daily closing, repairs, repair detail, reports, and settings were checked for overflow risks.
- Tables: wide tables remain inside horizontal scroll containers, while practical mobile views use cards.

## Verification viewports

Check logged-in pages at these widths:

- `320px`
- `375px`
- `390px`
- `430px`
- `768px`
- `1024px`
- `1440px`

Routes to verify:

- `/login`
- `/dashboard`
- `/products`
- `/customers`
- `/customers/[id]`
- `/pos`
- `/invoices`
- `/invoices/[id]`
- `/returns`
- `/expenses`
- `/daily-closing`
- `/repairs`
- `/repairs/[id]`
- `/reports`
- `/settings`

Expected result: no page-level horizontal overflow, tappable buttons, readable cards/forms, stable topbar/sidebar/mobile nav, and unchanged print output for invoice and repair receipt flows.
