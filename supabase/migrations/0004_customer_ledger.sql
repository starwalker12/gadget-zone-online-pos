-- Migration 0004: Customer Ledger Foundation
-- Adds double-entry customer ledger logging, running balance cache, and RLS policies.

create type public.ledger_entry_type as enum ('invoice_credit', 'credit_payment', 'adjustment', 'refund', 'opening_balance');
create type public.ledger_direction as enum ('debit', 'credit');
create type public.credit_payment_method as enum ('cash', 'card', 'easypaisa', 'jazzcash', 'bank_transfer');

-- Add outstanding_balance column to customers to cache current open balance
alter table public.customers add column outstanding_balance numeric(12,2) not null default 0;

-- 1. Create credit_payments table
create table public.credit_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method public.credit_payment_method not null,
  reference_number text,
  notes text,
  received_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create customer_ledger_entries table
create table public.customer_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  credit_payment_id uuid references public.credit_payments(id) on delete set null,
  entry_type public.ledger_entry_type not null,
  direction public.ledger_direction not null,
  amount numeric(12,2) not null check (amount >= 0),
  balance_after numeric(12,2) not null,
  description text,
  reference_number text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexing for ledger analysis and sorting
create index idx_customer_ledger_cust_created on public.customer_ledger_entries(customer_id, created_at desc);
create index idx_customer_ledger_org on public.customer_ledger_entries(organization_id);
create index idx_credit_payments_cust on public.credit_payments(customer_id);
create index idx_credit_payments_org on public.credit_payments(organization_id);

-- Enable triggers for set_updated_at
create trigger set_credit_payments_updated_at before update on public.credit_payments for each row execute function public.set_updated_at();
create trigger set_customer_ledger_entries_updated_at before update on public.customer_ledger_entries for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.credit_payments enable row level security;
alter table public.customer_ledger_entries enable row level security;

-- Scoped RLS Policies
create policy "Org scoped credit payments access"
on public.credit_payments for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Org scoped customer ledger access"
on public.customer_ledger_entries for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());


-- 3. Atomic POS checkout update to support customer ledger logging
create or replace function public.pos_checkout(
  p_branch_id uuid,
  p_customer_id uuid,
  p_cart jsonb,            -- [{product_id, quantity, unit_price, discount}]
  p_discount_total numeric,
  p_payment_method public.payment_method,
  p_amount_paid numeric,
  p_payment_ref text,
  p_note text
)
returns table(invoice_id uuid, invoice_no text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_profile_id uuid;
  v_branch_id uuid := p_branch_id;
  v_invoice_id uuid := gen_random_uuid();
  v_invoice_no text;
  v_seq int;
  v_subtotal numeric := 0;
  v_grand numeric;
  v_balance numeric;
  v_item jsonb;
  v_product record;
  v_qty int;
  v_unit_price numeric;
  v_line_discount numeric;
  v_line_total numeric;
  v_status public.invoice_status;
  v_curr_balance numeric;
  v_balance_after numeric;
begin
  if v_user_id is null then raise exception 'Not authenticated' using errcode = '28000'; end if;

  select id, organization_id, branch_id
    into v_profile_id, v_org_id, v_branch_id
    from public.profiles
    where id = v_user_id and is_active = true;
  if v_org_id is null then raise exception 'No active profile' using errcode = 'P0001'; end if;

  if p_branch_id is not null then v_branch_id := p_branch_id; end if;
  if v_branch_id is null then raise exception 'No branch assigned for this user' using errcode = 'P0001'; end if;

  if p_cart is null or jsonb_typeof(p_cart) <> 'array' or jsonb_array_length(p_cart) = 0 then
    raise exception 'Cart is empty' using errcode = 'P0001';
  end if;

  -- Serialize invoice number generation per organization
  perform 1 from public.organizations where id = v_org_id for update;

  select coalesce(
    max(nullif(regexp_replace(invoice_no, '\D', '', 'g'), '')::int),
    0
  ) + 1
    into v_seq
    from public.invoices
    where organization_id = v_org_id;
  v_invoice_no := 'INV-' || lpad(v_seq::text, 6, '0');

  -- Validate cart, lock products, accumulate subtotal
  for v_item in select * from jsonb_array_elements(p_cart) loop
    select id, name, type, sale_price, purchase_price, stock_quantity, is_active
      into v_product
      from public.products
      where id = (v_item->>'product_id')::uuid and organization_id = v_org_id
      for update;
    if not found then raise exception 'Product not in catalog' using errcode = 'P0001'; end if;
    if not v_product.is_active then
      raise exception 'Product not available: %', v_product.name using errcode = 'P0001';
    end if;

    v_qty := coalesce((v_item->>'quantity')::int, 0);
    if v_qty <= 0 then raise exception 'Invalid quantity for %', v_product.name using errcode = 'P0001'; end if;

    if v_product.type = 'product' and v_product.stock_quantity < v_qty then
      raise exception 'Insufficient stock for % (have %, need %)',
        v_product.name, v_product.stock_quantity, v_qty using errcode = 'P0001';
    end if;

    v_unit_price := coalesce(nullif(v_item->>'unit_price','')::numeric, v_product.sale_price);
    if v_unit_price < 0 then raise exception 'Negative unit price' using errcode = 'P0001'; end if;
    v_line_discount := coalesce(nullif(v_item->>'discount','')::numeric, 0);
    if v_line_discount < 0 then raise exception 'Negative line discount' using errcode = 'P0001'; end if;
    v_line_total := greatest((v_unit_price * v_qty) - v_line_discount, 0);
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  v_grand := greatest(v_subtotal - coalesce(p_discount_total, 0), 0);
  v_balance := greatest(v_grand - coalesce(p_amount_paid, 0), 0);

  -- POS validation: Walk-in checks (cannot have debt)
  if p_customer_id is null and v_balance > 0 then
    raise exception 'Walk-in customer checkout must be fully paid' using errcode = 'P0001';
  end if;

  v_status := case
    when v_grand = 0 then 'paid'::public.invoice_status
    when coalesce(p_amount_paid, 0) >= v_grand then 'paid'::public.invoice_status
    when coalesce(p_amount_paid, 0) > 0 then 'partial'::public.invoice_status
    else 'unpaid'::public.invoice_status
  end;

  insert into public.invoices (
    id, organization_id, branch_id, customer_id, invoice_no, status,
    subtotal, discount_total, grand_total, amount_paid, balance_due,
    note, created_by
  ) values (
    v_invoice_id, v_org_id, v_branch_id, p_customer_id, v_invoice_no, v_status,
    v_subtotal, coalesce(p_discount_total, 0), v_grand,
    coalesce(p_amount_paid, 0), v_balance,
    nullif(p_note, ''), v_profile_id
  );

  for v_item in select * from jsonb_array_elements(p_cart) loop
    select id, name, type, sale_price, purchase_price
      into v_product from public.products where id = (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::int;
    v_unit_price := coalesce(nullif(v_item->>'unit_price','')::numeric, v_product.sale_price);
    v_line_discount := coalesce(nullif(v_item->>'discount','')::numeric, 0);
    v_line_total := greatest((v_unit_price * v_qty) - v_line_discount, 0);

    insert into public.invoice_items (
      organization_id, invoice_id, product_id, product_name, product_type,
      quantity, purchase_price, unit_price, item_discount, line_total
    ) values (
      v_org_id, v_invoice_id, v_product.id, v_product.name, v_product.type,
      v_qty, v_product.purchase_price, v_unit_price, v_line_discount, v_line_total
    );

    if v_product.type = 'product' then
      update public.products
        set stock_quantity = stock_quantity - v_qty
        where id = v_product.id;
    end if;
  end loop;

  if coalesce(p_amount_paid, 0) > 0 then
    insert into public.payments (
      organization_id, branch_id, invoice_id, customer_id,
      method, amount, reference_no, received_by
    ) values (
      v_org_id, v_branch_id, v_invoice_id, p_customer_id,
      p_payment_method, p_amount_paid, nullif(p_payment_ref, ''), v_profile_id
    );
  end if;

  -- 4. Customer outstanding balance and ledger creation
  if p_customer_id is not null and v_balance > 0 then
    select outstanding_balance into v_curr_balance from public.customers where id = p_customer_id for update;
    v_balance_after := coalesce(v_curr_balance, 0) + v_balance;

    update public.customers
      set outstanding_balance = v_balance_after
      where id = p_customer_id;

    insert into public.customer_ledger_entries (
      organization_id, branch_id, customer_id, invoice_id, entry_type, direction,
      amount, balance_after, description, created_by
    ) values (
      v_org_id, v_branch_id, p_customer_id, v_invoice_id, 'invoice_credit', 'debit',
      v_balance, v_balance_after, 'Invoice ' || v_invoice_no || ' balance due', v_profile_id
    );
  end if;

  return query select v_invoice_id, v_invoice_no;
end;
$$;


-- 5. Atomic General Account Settlement / Credit Payment
create or replace function public.record_credit_payment(
  p_customer_id uuid,
  p_amount numeric,
  p_method public.credit_payment_method,
  p_reference_number text,
  p_notes text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_profile_id uuid;
  v_branch_id uuid;
  v_curr_balance numeric;
  v_balance_after numeric;
  v_payment_id uuid := gen_random_uuid();
begin
  if v_user_id is null then raise exception 'Not authenticated' using errcode = '28000'; end if;

  select id, organization_id, branch_id
    into v_profile_id, v_org_id, v_branch_id
    from public.profiles
    where id = v_user_id and is_active = true;
  if v_org_id is null then raise exception 'No active profile' using errcode = 'P0001'; end if;

  -- Check outstanding balance of the customer and lock the row
  select outstanding_balance into v_curr_balance from public.customers where id = p_customer_id for update;
  if not found then raise exception 'Customer not found' using errcode = 'P0001'; end if;

  -- Prevent balance from dropping below zero
  if coalesce(v_curr_balance, 0) < p_amount then
    raise exception 'Payment amount exceeds outstanding balance' using errcode = 'P0001';
  end if;

  v_balance_after := coalesce(v_curr_balance, 0) - p_amount;

  -- Update outstanding balance
  update public.customers
    set outstanding_balance = v_balance_after
    where id = p_customer_id;

  -- Insert into credit_payments
  insert into public.credit_payments (
    id, organization_id, branch_id, customer_id, amount, method, reference_number, notes, received_by
  ) values (
    v_payment_id, v_org_id, v_branch_id, p_customer_id, p_amount, p_method, p_reference_number, p_notes, v_profile_id
  );

  -- Insert into customer_ledger_entries
  insert into public.customer_ledger_entries (
    organization_id, branch_id, customer_id, credit_payment_id, entry_type, direction,
    amount, balance_after, description, reference_number, created_by
  ) values (
    v_org_id, v_branch_id, p_customer_id, v_payment_id, 'credit_payment', 'credit',
    p_amount, v_balance_after, coalesce(nullif(p_notes, ''), 'Credit payment settlement'), p_reference_number, v_profile_id
  );
end;
$$;

grant execute on function public.record_credit_payment(
  uuid, numeric, public.credit_payment_method, text, text
) to authenticated;
