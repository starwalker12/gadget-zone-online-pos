"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/lib/auth/session";
import { canUsePos, canWriteCatalog } from "@/lib/permissions";
import { canSellNew, canDiscountNew, canSellAtLossNew } from "@/lib/staff-permissions";
import { logAudit } from "@/lib/audit";
import {
  checkoutSchema,
  quickCustomerSchema,
  type CheckoutInput,
  type QuickCustomerInput,
} from "@/lib/validation/pos";

export type CheckoutResult = {
  ok: boolean;
  error: string | null;
  invoice_id?: string;
  invoice_no?: string;
};

export type QuickCustomerResult = {
  ok: boolean;
  error: string | null;
  customer?: { id: string; name: string; phone: string | null };
};

export async function checkoutAction(input: CheckoutInput): Promise<CheckoutResult> {
  const ctx = await getCurrentContext();
  if (!ctx.user) redirect("/login");
  if (!ctx.profile?.organization_id) redirect("/setup");
  if (!(await canSellNew(ctx.profile))) {
    return { ok: false, error: "You do not have permission to sell." };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const profile = ctx.profile;

  // ── can_discount check ──
  const hasDiscount = parsed.data.discount_total > 0 || parsed.data.cart.some((item) => item.discount > 0);
  if (hasDiscount && !(await canDiscountNew(profile))) {
    return { ok: false, error: "You do not have permission to apply discounts." };
  }

  const supabase = await createClient();

  // ── can_sell_at_loss: temporarily enable loss override on cart products ──
  const originalLossFlags = new Map<string, boolean>();
  if (await canSellAtLossNew(profile)) {
    const { data: products } = await supabase
      .from("products")
      .select("id, allow_sell_at_loss")
      .in("id", parsed.data.cart.map((i) => i.product_id))
      .eq("organization_id", profile.organization_id);
    const toEnable: string[] = [];
    for (const p of products ?? []) {
      originalLossFlags.set(p.id, p.allow_sell_at_loss);
      if (!p.allow_sell_at_loss) toEnable.push(p.id);
    }
    if (toEnable.length > 0) {
      await supabase
        .from("products")
        .update({ allow_sell_at_loss: true })
        .in("id", toEnable)
        .eq("organization_id", profile.organization_id);
    }
  }

  let rpcError: string | null = null;
  let rpcRow: { invoice_id: string; invoice_no: string } | null = null;

  try {
    const { data, error } = await supabase.rpc("pos_checkout", {
      p_branch_id: profile.branch_id,
      p_customer_id: parsed.data.customer_id ?? null,
      p_cart: parsed.data.cart,
      p_discount_total: parsed.data.discount_total,
      p_payment_method: parsed.data.payment_method,
      p_amount_paid: parsed.data.amount_paid,
      p_payment_ref: parsed.data.payment_reference ?? null,
      p_note: parsed.data.note ?? null,
    });

    if (error) {
      rpcError = error.message;
    } else {
      rpcRow = (Array.isArray(data) ? data[0] : data) as { invoice_id: string; invoice_no: string } | null;
    }
  } finally {
    // Revert loss override flags
    for (const [productId, originalValue] of originalLossFlags) {
      if (!originalValue) {
        await supabase
          .from("products")
          .update({ allow_sell_at_loss: false })
          .eq("id", productId)
          .eq("organization_id", profile.organization_id);
      }
    }
  }

  if (rpcError) {
    return { ok: false, error: rpcError };
  }

  if (!rpcRow?.invoice_id) {
    return { ok: false, error: "Checkout returned no invoice." };
  }

  const row = rpcRow;

  revalidatePath("/pos");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath("/products");

  logAudit({
    module: "pos",
    action: "pos.checkout_completed",
    details: `Checkout completed: Invoice ${row.invoice_no}`,
    metadata: { invoice_id: row.invoice_id, invoice_no: row.invoice_no, payment_method: parsed.data.payment_method, amount_paid: parsed.data.amount_paid },
  });

  return { ok: true, error: null, invoice_id: row.invoice_id, invoice_no: row.invoice_no };
}

export async function quickCreateCustomerAction(
  input: QuickCustomerInput,
): Promise<QuickCustomerResult> {
  const ctx = await getCurrentContext();
  if (!ctx.user) redirect("/login");
  if (!ctx.profile?.organization_id) redirect("/setup");
  // Anyone who can run POS can create a walk-in customer; otherwise restrict to catalog writers.
  if (!canUsePos(ctx.profile.role) && !canWriteCatalog(ctx.profile.role)) {
    return { ok: false, error: "You do not have permission to create customers." };
  }

  const parsed = quickCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      organization_id: ctx.profile.organization_id,
      branch_id: ctx.profile.branch_id,
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
    })
    .select("id, name, phone")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/customers");
  return { ok: true, error: null, customer: data as { id: string; name: string; phone: string | null } };
}
