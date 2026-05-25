import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PosProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  category_id: string | null;
  category_name: string | null;
  type: "product" | "service";
  sale_price: number;
  stock_quantity: number;
  minimum_stock: number;
};

export type PosCustomer = {
  id: string;
  name: string;
  phone: string | null;
};

export async function listPosProducts(organizationId: string): Promise<PosProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, sku, barcode, category_id, type, sale_price,
       stock_quantity, minimum_stock, product_categories(name)`,
    )
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => {
    const cats = r.product_categories as { name?: string } | { name?: string }[] | null;
    const categoryName = Array.isArray(cats) ? cats[0]?.name ?? null : cats?.name ?? null;
    return {
      id: r.id,
      name: r.name,
      sku: r.sku,
      barcode: r.barcode,
      category_id: r.category_id,
      category_name: categoryName,
      type: r.type,
      sale_price: Number(r.sale_price ?? 0),
      stock_quantity: Number(r.stock_quantity ?? 0),
      minimum_stock: Number(r.minimum_stock ?? 0),
    } satisfies PosProduct;
  });
}

export async function listPosCustomers(organizationId: string): Promise<PosCustomer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("organization_id", organizationId)
    .eq("is_archived", false)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PosCustomer[];
}
