-- POS atomic checkout: creates invoice + items + (optional) payment + decrements stock,
-- all inside one transaction with server-side validation. Honors RLS via security invoker.

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

  return query select v_invoice_id, v_invoice_no;
end;
$$;

grant execute on function public.pos_checkout(
  uuid, uuid, jsonb, numeric, public.payment_method, numeric, text, text
) to authenticated;
