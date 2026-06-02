-- Migration 0033: Barcode unique index
--
-- Adds a per-organization unique partial index on products.barcode.
-- Allows multiple NULL barcodes (no barcode assigned) but prevents
-- duplicate non-null barcodes within the same organization.
--
-- This is additive only — no existing columns, RLS, or tables are altered.

create unique index products_org_barcode_unique
  on public.products (organization_id, barcode)
  where barcode is not null;
