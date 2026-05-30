import "server-only";
import { createClient } from "@/lib/supabase/server";
import { FINALIZED_INVOICE_STATUSES } from "./daily-closing";

export type TopProduct = {
  productName: string;
  quantity: number;
  revenue: number;
};

export type DashboardSummary = {
  todayProfit: number;
  grossSales: number;
  returnsTotal: number;
  returnsCount: number;
  expensesTotal: number;
  lowStockCount: number;
  topSellingProducts: TopProduct[];
  pendingRepairsCount: number;
  supplierDuesTotal: number;
  customerDuesTotal: number;
};

function todayBounds(): { start: string; end: string } {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60_000;
  const localDate = new Date(d.getTime() - tz).toISOString().slice(0, 10);
  const start = new Date(`${localDate}T00:00:00`);
  const end = new Date(`${localDate}T23:59:59.999`);
  return { start: start.toISOString(), end: end.toISOString() };
}

function last7DaysBounds(): { start: string; end: string } {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60_000;
  const localDate = new Date(d.getTime() - tz).toISOString().slice(0, 10);
  const start = new Date(`${localDate}T00:00:00`);
  start.setDate(start.getDate() - 6);
  const end = new Date(`${localDate}T23:59:59.999`);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function getDashboardSummary(
  organizationId: string,
  branchId: string | null,
): Promise<DashboardSummary> {
  const supabase = await createClient();
  const { start: todayStart, end: todayEnd } = todayBounds();

  // Today's finalized invoices
  let invoicesQuery = supabase
    .from("invoices")
    .select("id, grand_total")
    .eq("organization_id", organizationId)
    .in("status", FINALIZED_INVOICE_STATUSES)
    .gte("invoice_date", todayStart)
    .lte("invoice_date", todayEnd);
  if (branchId) {
    invoicesQuery = invoicesQuery.eq("branch_id", branchId);
  }

  // Today's completed returns
  let returnsQuery = supabase
    .from("returns")
    .select("refund_amount")
    .eq("organization_id", organizationId)
    .eq("status", "completed")
    .gte("created_at", todayStart)
    .lte("created_at", todayEnd);
  if (branchId) {
    returnsQuery = returnsQuery.eq("branch_id", branchId);
  }

  // Today's active expenses
  let expensesQuery = supabase
    .from("expenses")
    .select("amount")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .gte("spent_at", todayStart)
    .lte("spent_at", todayEnd);
  if (branchId) {
    expensesQuery = expensesQuery.eq("branch_id", branchId);
  }

  // Low stock products (org-wide)
  const lowStockQuery = supabase
    .from("products")
    .select("stock_quantity, minimum_stock")
    .eq("organization_id", organizationId)
    .eq("type", "product");

  // Pending repairs
  let repairsQuery = supabase
    .from("repairs")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .in("status", ["received", "waiting_for_parts", "in_progress"]);
  if (branchId) {
    repairsQuery = repairsQuery.eq("branch_id", branchId);
  }

  // Customer dues (org-wide)
  const customerDuesQuery = supabase
    .from("customers")
    .select("outstanding_balance")
    .eq("organization_id", organizationId)
    .gt("outstanding_balance", 0);

  // Supplier dues (org-wide)
  const supplierDuesQuery = supabase
    .from("suppliers")
    .select("outstanding_balance")
    .eq("organization_id", organizationId)
    .gt("outstanding_balance", 0);

  const [
    invoicesRes,
    returnsRes,
    expensesRes,
    lowStockRes,
    repairsRes,
    customerDuesRes,
    supplierDuesRes,
  ] = await Promise.all([
    invoicesQuery,
    returnsQuery,
    expensesQuery,
    lowStockQuery,
    repairsQuery,
    customerDuesQuery,
    supplierDuesQuery,
  ]);

  if (invoicesRes.error) throw new Error(invoicesRes.error.message);
  if (returnsRes.error) throw new Error(returnsRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);
  if (customerDuesRes.error) throw new Error(customerDuesRes.error.message);
  if (supplierDuesRes.error) throw new Error(supplierDuesRes.error.message);

  const invoices = invoicesRes.data ?? [];
  const grossSales = invoices.reduce((s, r) => s + Number(r.grand_total ?? 0), 0);

  const returns = returnsRes.data ?? [];
  const returnsTotal = returns.reduce((s, r) => s + Number(r.refund_amount ?? 0), 0);
  const returnsCount = returns.length;

  const expenses = expensesRes.data ?? [];
  const expensesTotal = expenses.reduce((s, r) => s + Number(r.amount ?? 0), 0);

  const lowStockCount =
    lowStockRes.data?.filter(
      (p) => Number(p.stock_quantity ?? 0) <= Number(p.minimum_stock ?? 0),
    ).length ?? 0;

  const pendingRepairsCount = repairsRes.count ?? 0;

  const customerDuesTotal =
    customerDuesRes.data?.reduce((s, r) => s + Number(r.outstanding_balance ?? 0), 0) ?? 0;

  const supplierDuesTotal =
    supplierDuesRes.data?.reduce((s, r) => s + Number(r.outstanding_balance ?? 0), 0) ?? 0;

  // Profit and top-selling from today's invoice items
  const invoiceIds = invoices.map((r) => r.id);
  let profitFromItems = 0;
  let topSellingProducts: TopProduct[] = [];

  if (invoiceIds.length > 0) {
    const itemsRes = await supabase
      .from("invoice_items")
      .select("product_name, product_type, quantity, purchase_price, line_total")
      .in("invoice_id", invoiceIds);

    if (!itemsRes.error && itemsRes.data) {
      const productMap = new Map<string, { quantity: number; revenue: number }>();
      for (const item of itemsRes.data) {
        const qty = Number(item.quantity ?? 0);
        const rev = Number(item.line_total ?? 0);
        if (item.product_type === "product") {
          const cost = Number(item.purchase_price ?? 0) * qty;
          profitFromItems += rev - cost;
        }
        const name = item.product_name as string;
        const existing = productMap.get(name);
        if (existing) {
          existing.quantity += qty;
          existing.revenue += rev;
        } else {
          productMap.set(name, { quantity: qty, revenue: rev });
        }
      }
      topSellingProducts = [...productMap.entries()]
        .map(([n, { quantity, revenue }]) => ({ productName: n, quantity, revenue }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    }
  }

  // Fallback to last 7 days if no sales today
  if (topSellingProducts.length === 0) {
    const { start: weekStart, end: weekEnd } = last7DaysBounds();
    let weekQuery = supabase
      .from("invoices")
      .select("id")
      .eq("organization_id", organizationId)
      .in("status", FINALIZED_INVOICE_STATUSES)
      .gte("invoice_date", weekStart)
      .lte("invoice_date", weekEnd);
    if (branchId) {
      weekQuery = weekQuery.eq("branch_id", branchId);
    }
    const weekRes = await weekQuery;
    const weekIds = (weekRes.data ?? []).map((r) => r.id);
    if (weekIds.length > 0) {
      const weekItemsRes = await supabase
        .from("invoice_items")
        .select("product_name, quantity, line_total")
        .in("invoice_id", weekIds);
      if (!weekItemsRes.error && weekItemsRes.data) {
        const productMap = new Map<string, { quantity: number; revenue: number }>();
        for (const item of weekItemsRes.data) {
          const name = item.product_name as string;
          const qty = Number(item.quantity ?? 0);
          const rev = Number(item.line_total ?? 0);
          const existing = productMap.get(name);
          if (existing) {
            existing.quantity += qty;
            existing.revenue += rev;
          } else {
            productMap.set(name, { quantity: qty, revenue: rev });
          }
        }
        topSellingProducts = [...productMap.entries()]
          .map(([n, { quantity, revenue }]) => ({ productName: n, quantity, revenue }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
      }
    }
  }

  const todayProfit = profitFromItems - expensesTotal - returnsTotal;

  return {
    todayProfit,
    grossSales,
    returnsTotal,
    returnsCount,
    expensesTotal,
    lowStockCount,
    topSellingProducts,
    pendingRepairsCount,
    customerDuesTotal,
    supplierDuesTotal,
  };
}
