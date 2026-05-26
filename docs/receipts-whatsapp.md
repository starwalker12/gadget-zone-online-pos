# 80mm Receipts and WhatsApp Sharing

This module adds browser-based receipt output and WhatsApp Web sharing for customer-facing documents.

## Invoice Receipts

Invoice detail pages now offer:
- **Print A4**: Preserves the existing full invoice layout.
- **Print 80mm**: Opens the browser print dialog with a compact thermal receipt layout.
- **Share WhatsApp**: Opens a safe `wa.me` / WhatsApp Web link with a prefilled invoice summary.

The 80mm invoice receipt includes shop logo, shop/branch contact, invoice number, date/time, customer, cashier, compact item rows, subtotal, discount, grand total, paid amount, balance, payment methods, note, and footer. Service rows show principal, commission, and reference values when those fields are populated.

## Repair Receipts

Repair detail pages now offer:
- **Print A4**: Preserves the existing repair intake receipt.
- **Print 80mm**: Prints a compact repair receipt for thermal paper.
- **Share WhatsApp**: Opens WhatsApp Web with a job status summary and production repair URL.

The 80mm repair receipt includes shop logo, job number, status, intake date/time, customer/phone, device, problem, accessories, expected delivery, estimate, advance, balance, payment method, configured receipt terms, and footer.

## Branding

Receipts use the Settings branding profile:
- Shop name and branch name
- Logo URL/path
- Phone and WhatsApp support
- Invoice footer
- Repair receipt terms
- Currency

No paid storage or WhatsApp Business API is required.

## Planned

- Direct ESC/POS printer integration is planned for a later hardware milestone.
- Return/refund detail receipts can be added when a dedicated return detail page exists.
- Daily Closing 80mm summaries remain planned; the existing reports/closing print surfaces stay unchanged for now.
