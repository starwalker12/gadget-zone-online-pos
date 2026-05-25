create extension if not exists "pgcrypto";

create type public.user_role as enum ('owner', 'admin', 'manager', 'cashier', 'technician');
create type public.product_type as enum ('product', 'service');
create type public.invoice_status as enum ('draft', 'paid', 'partial', 'unpaid', 'void');
create type public.payment_method as enum ('cash', 'card', 'easypaisa', 'jazzcash', 'bank_transfer', 'customer_credit');
create type public.repair_status as enum ('received', 'waiting_for_parts', 'in_progress', 'completed', 'delivered', 'cancelled');
create type public.expense_status as enum ('active', 'archived');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  phone text,
  email text,
  address text,
  currency_code text not null default 'PKR',
  timezone text not null default 'Asia/Karachi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  full_name text not null,
  role public.user_role not null default 'cashier',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid() and is_active = true
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active = true
$$;

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  company text,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  category_id uuid references public.product_categories(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  name text not null,
  sku text,
  barcode text,
  type public.product_type not null default 'product',
  purchase_price numeric(12,2) not null default 0 check (purchase_price >= 0),
  sale_price numeric(12,2) not null default 0 check (sale_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  minimum_stock integer not null default 5 check (minimum_stock >= 0),
  default_warranty text not null default 'None',
  service_type text,
  service_pricing_mode text,
  default_commission_amount numeric(12,2) not null default 0 check (default_commission_amount >= 0),
  default_commission_percent numeric(7,4) not null default 0 check (default_commission_percent >= 0),
  requires_account_number boolean not null default false,
  requires_provider boolean not null default false,
  requires_reference boolean not null default false,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  credit_limit numeric(12,2) not null default 0,
  is_archived boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_no text not null,
  status public.invoice_status not null default 'draft',
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  customer_credit_applied numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  balance_due numeric(12,2) not null default 0,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  invoice_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, invoice_no)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_type public.product_type not null default 'product',
  quantity integer not null default 1 check (quantity > 0),
  purchase_price numeric(12,2) not null default 0,
  unit_price numeric(12,2) not null default 0,
  item_discount numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  service_provider text,
  service_direction text,
  service_account_number text,
  service_receiver_account text,
  service_reference_no text,
  service_transaction_amount numeric(12,2) not null default 0,
  service_commission numeric(12,2) not null default 0,
  service_total_charged numeric(12,2) not null default 0,
  service_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  invoice_id uuid references public.invoices(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  method public.payment_method not null default 'cash',
  amount numeric(12,2) not null check (amount >= 0),
  reference_no text,
  note text,
  received_by uuid references public.profiles(id) on delete set null,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.repairs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  job_no text not null,
  customer_name text not null,
  customer_phone text,
  device_type text not null default 'Other',
  device_model text,
  serial_imei text,
  problem_description text not null,
  diagnosis text,
  estimated_cost numeric(12,2) not null default 0,
  advance_paid numeric(12,2) not null default 0,
  final_cost numeric(12,2) not null default 0,
  status public.repair_status not null default 'received',
  expected_delivery_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, job_no)
);

create table public.repair_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  repair_id uuid not null references public.repairs(id) on delete cascade,
  old_status public.repair_status,
  new_status public.repair_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  category text not null default 'Miscellaneous',
  amount numeric(12,2) not null check (amount >= 0),
  payment_method public.payment_method not null default 'cash',
  vendor_name text,
  notes text,
  status public.expense_status not null default 'active',
  spent_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  archived_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_closings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete restrict,
  closing_date date not null,
  bills_count integer not null default 0,
  cash_sales numeric(12,2) not null default 0,
  digital_payments numeric(12,2) not null default 0,
  credit_pending numeric(12,2) not null default 0,
  expenses_total numeric(12,2) not null default 0,
  refunds_total numeric(12,2) not null default 0,
  service_commission_earned numeric(12,2) not null default 0,
  service_cash_in numeric(12,2) not null default 0,
  service_cash_out numeric(12,2) not null default 0,
  expected_closing_cash numeric(12,2) not null default 0,
  actual_closing_cash numeric(12,2) not null default 0,
  cash_difference numeric(12,2) not null default 0,
  notes text,
  finalized_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, branch_id, closing_date)
);

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete cascade,
  shop_name text not null default 'Gadget Zone',
  business_subtitle text not null default 'Mobile & Accessories Hub',
  phone text,
  email text,
  address text,
  invoice_template text not null default 'standard',
  theme_accent text not null default 'blue',
  receipt_footer text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  module text not null,
  action text not null,
  details text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_branches_org on public.branches(organization_id);
create index idx_profiles_org on public.profiles(organization_id);
create index idx_categories_org on public.product_categories(organization_id);
create index idx_products_org_branch on public.products(organization_id, branch_id);
create index idx_products_search on public.products using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(barcode, '')));
create index idx_customers_org_phone on public.customers(organization_id, phone);
create index idx_invoices_org_branch_date on public.invoices(organization_id, branch_id, invoice_date desc);
create index idx_invoice_items_invoice on public.invoice_items(invoice_id);
create index idx_payments_invoice on public.payments(invoice_id);
create index idx_repairs_org_status on public.repairs(organization_id, status);
create index idx_expenses_org_branch_date on public.expenses(organization_id, branch_id, spent_at desc);
create index idx_daily_closings_org_branch_date on public.daily_closings(organization_id, branch_id, closing_date desc);
create index idx_audit_logs_org_created on public.audit_logs(organization_id, created_at desc);

create trigger set_organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger set_branches_updated_at before update on public.branches for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_product_categories_updated_at before update on public.product_categories for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger set_suppliers_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
create trigger set_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger set_invoice_items_updated_at before update on public.invoice_items for each row execute function public.set_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger set_repairs_updated_at before update on public.repairs for each row execute function public.set_updated_at();
create trigger set_expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();
create trigger set_daily_closings_updated_at before update on public.daily_closings for each row execute function public.set_updated_at();
create trigger set_app_settings_updated_at before update on public.app_settings for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.repairs enable row level security;
alter table public.repair_status_history enable row level security;
alter table public.expenses enable row level security;
alter table public.daily_closings enable row level security;
alter table public.app_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "Profiles can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or organization_id = public.current_organization_id());

create policy "Profiles can update themselves"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Organization members can read their organization"
on public.organizations for select
to authenticated
using (id = public.current_organization_id());

create policy "Owners and admins can update their organization"
on public.organizations for update
to authenticated
using (id = public.current_organization_id() and public.current_user_role() in ('owner', 'admin'))
with check (id = public.current_organization_id());

create policy "Org scoped branch access"
on public.branches for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped category access"
on public.product_categories for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped product access"
on public.products for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped customer access"
on public.customers for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped supplier access"
on public.suppliers for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped invoice access"
on public.invoices for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped invoice item access"
on public.invoice_items for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped payment access"
on public.payments for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped repair access"
on public.repairs for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped repair history access"
on public.repair_status_history for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped expense access"
on public.expenses for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped daily closing access"
on public.daily_closings for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped settings access"
on public.app_settings for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped audit log read"
on public.audit_logs for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Org scoped audit log insert"
on public.audit_logs for insert
to authenticated
with check (organization_id = public.current_organization_id());
