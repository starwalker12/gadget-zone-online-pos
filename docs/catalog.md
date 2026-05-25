# Catalog Management

The Catalog module covers **Products**, **Categories**, and **Suppliers**. It lives at `/products` and uses a tabbed UI driven by URL search params (`?tab=products|categories|suppliers`).

## Tables used

All existing tables from `supabase/migrations/0001_initial_schema.sql`:

- `product_categories` — `name`, `is_active`, plus `description` (added in `0002_catalog_enhancements.sql`)
- `suppliers` — `name`, `company`, `phone`, `email`, `address`, `notes`, `is_active`
- `products` — name, `sku`, `barcode`, `category_id`, `supplier_id`, `type` (`product`|`service`), `purchase_price` (cost), `sale_price`, `stock_quantity`, `minimum_stock` (reorder level), `notes`, `is_active`

RLS from migration 0001 already restricts everything by `organization_id = current_organization_id()`. No RLS changes were needed.

## Permissions (app-level)

`src/lib/permissions.ts` exposes `canWriteCatalog(role)`. Writers: `owner`, `admin`, `manager`. Cashiers and technicians can view but cannot create/edit/archive. Server actions check this server-side — a banner in the UI tells viewer-roles their access is read-only.

## Server actions

`src/app/products/actions.ts`:

- `saveCategoryAction`, `archiveCategoryAction`, `unarchiveCategoryAction`
- `saveSupplierAction`, `archiveSupplierAction`, `unarchiveSupplierAction`
- `saveProductAction`, `archiveProductAction`, `unarchiveProductAction`

All input is validated server-side with zod schemas in `src/lib/validation/catalog.ts`. Each mutating action calls `revalidatePath('/products')` (and `/dashboard` where counts change).

## Data layer

`src/lib/data/catalog.ts`:

- `listCategories`, `listCategoriesWithCounts` (joins active product count)
- `listSuppliers`
- `listProducts(filters)` — supports `search` (name/sku/barcode), `categoryId`, `lowStockOnly`, `includeInactive`
- `catalogCounts` — totals used on dashboard and the catalog stat cards

## UI

- Stat cards: Active products, Low stock, Active categories, Active suppliers.
- Tabs: Products / Categories / Suppliers.
- Products tab: filterable table (desktop) / card list (mobile), low-stock badge, add/edit via a collapsible `<details>` block, archive/restore buttons.
- Categories tab: name, description, product count, status, edit/archive/restore.
- Suppliers tab: name, company, phone, email, address, status, edit/archive/restore.

Services have stock fields disabled and are stored with `stock_quantity = 0`, `minimum_stock = 0`.

## Dashboard integration

The dashboard now reads `catalogCounts()` and shows Active products, Low stock, Categories, Suppliers. The original Customers / Invoices / Repairs counts remain in a secondary row.

## Demo data

`supabase/seed.sql` already contains demo categories, suppliers, and products. **It is not run against production.** To seed a fresh dev database, apply the seed file manually.

## Future tasks

- POS checkout flow (invoices + invoice items + payments) — next milestone.
- Stock movement history (separate ledger table).
- Bulk import via CSV.
- Per-branch stock when multi-branch is introduced.
