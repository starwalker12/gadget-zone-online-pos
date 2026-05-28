-- Migration 0026: Customer Settlement Accounting Parity
-- Adds write-off support, FIFO allocation on settlements, daily closing credit collection tracking.
-- Ensures no double-counting of revenue.

-- 1. Alter ledger_entry_type enum to add write_off
alter type public.ledger_entry_type add value if not exists 'write_off';

-- 2. Create customer_write_offs table
create table public.customer_write_offs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  reason text not null,
  written_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customer_write_offs_cust on public.customer_write_offs(customer_id);
create index idx_customer_write_offs_org on public.customer_write_offs(organization_id);

create trigger set_customer_write_offs_updated_at before update on public.customer_write_offs for each row execute function public.set_updated_at();

alter table public.customer_write_offs enable row level security;

create policy "Org scoped customer write-offs access"
on public.customer_write_offs for all
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

-- 3. Add credit collection and write-off columns to daily_closings
alter table public.daily_closings
  add column if not exists credit_collection_cash numeric(12,2) not null default 0,
  add column if not exists credit_collection_digital numeric(12,2) not null default 0,
  add column if not exists credit_write_offs numeric(12,2) not null default 0;

-- 4. Updated record_credit_payment with FIFO allocation to oldest unpaid/partial invoices
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
  v_remaining numeric;
  v_inv record;
  v_alloc numeric;
  v_new_amount_paid numeric;
  v_new_balance_due numeric;
  v_new_status public.invoice_status;
begin
  if v_user_id is null then raise exception 'Not authenticated' using errcode = '28000'; end if;

  select id, organization_id, branch_id
    into v_profile_id, v_org_id, v_branch_id
    from public.profiles
    where id = v_user_id and is_active = true;
  if v_org_id is null then raise exception 'No active profile' using errcode = 'P0001'; end if;

  -- Lock customer row and check balance
  select outstanding_balance into v_curr_balance from public.customers where id = p_customer_id for update;
  if not found then raise exception 'Customer not found' using errcode = 'P0001'; end if;

  if coalesce(v_curr_balance, 0) < p_amount then
    raise exception 'Payment amount exceeds outstanding balance' using errcode = 'P0001';
  end if;

  v_balance_after := coalesce(v_curr_balance, 0) - p_amount;

  -- Update customer outstanding balance
  update public.customers
    set outstanding_balance = v_balance_after
    where id = p_customer_id;

  -- Insert into credit_payments
  insert into public.credit_payments (
    id, organization_id, branch_id, customer_id, amount, method, reference_number, notes, received_by
  ) values (
    v_payment_id, v_org_id, v_branch_id, p_customer_id, p_amount, p_method, p_reference_number, p_notes, v_profile_id
  );

  -- FIFO allocation: allocate payment to oldest unpaid/partial invoices first
  v_remaining := p_amount;
  for v_inv in
    select id, balance_due, amount_paid, status
    from public.invoices
    where customer_id = p_customer_id
      and organization_id = v_org_id
      and status in ('unpaid', 'partial')
      and balance_due > 0
    order by invoice_date asc, created_at asc
    for update
  loop
    exit when v_remaining <= 0;

    v_alloc := least(v_remaining, v_inv.balance_due);
    v_new_amount_paid := v_inv.amount_paid + v_alloc;
    v_new_balance_due := v_inv.balance_due - v_alloc;

    if v_new_balance_due = 0 then
      v_new_status := 'paid'::public.invoice_status;
    else
      v_new_status := 'partial'::public.invoice_status;
    end if;

    update public.invoices
      set amount_paid = v_new_amount_paid,
          balance_due = v_new_balance_due,
          status = v_new_status
      where id = v_inv.id;

    v_remaining := v_remaining - v_alloc;
  end loop;

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

-- 5. Write-off RPC: record a credit write-off, reduce outstanding balance, log ledger entry
create or replace function public.record_customer_write_off(
  p_customer_id uuid,
  p_amount numeric,
  p_reason text
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
  v_write_off_id uuid := gen_random_uuid();
begin
  if v_user_id is null then raise exception 'Not authenticated' using errcode = '28000'; end if;

  select id, organization_id, branch_id
    into v_profile_id, v_org_id, v_branch_id
    from public.profiles
    where id = v_user_id and is_active = true;
  if v_org_id is null then raise exception 'No active profile' using errcode = 'P0001'; end if;

  -- Only owner and admin can write off
  if not exists (
    select 1 from public.profiles
    where id = v_user_id and role in ('owner', 'admin')
  ) then
    raise exception 'Only owner or admin can write off customer credit' using errcode = 'P0001';
  end if;

  -- Lock customer row
  select outstanding_balance into v_curr_balance from public.customers where id = p_customer_id for update;
  if not found then raise exception 'Customer not found' using errcode = 'P0001'; end if;

  if p_amount <= 0 then raise exception 'Write-off amount must be positive' using errcode = 'P0001'; end if;
  if p_amount > coalesce(v_curr_balance, 0) then
    raise exception 'Write-off amount exceeds outstanding balance' using errcode = 'P0001';
  end if;

  v_balance_after := coalesce(v_curr_balance, 0) - p_amount;

  -- Update customer outstanding balance
  update public.customers
    set outstanding_balance = v_balance_after
    where id = p_customer_id;

  -- Insert into customer_write_offs
  insert into public.customer_write_offs (
    id, organization_id, branch_id, customer_id, amount, reason, written_by
  ) values (
    v_write_off_id, v_org_id, v_branch_id, p_customer_id, p_amount, p_reason, v_profile_id
  );

  -- Insert into customer_ledger_entries
  insert into public.customer_ledger_entries (
    organization_id, branch_id, customer_id, entry_type, direction,
    amount, balance_after, description, created_by
  ) values (
    v_org_id, v_branch_id, p_customer_id, 'write_off', 'credit',
    p_amount, v_balance_after, 'Credit write-off: ' || p_reason, v_profile_id
  );
end;
$$;

grant execute on function public.record_customer_write_off(uuid, numeric, text) to authenticated;
