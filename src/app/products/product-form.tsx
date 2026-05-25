"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveProductAction, type ActionState } from "./actions";
import type { CategoryRow, ProductRow, SupplierRow } from "@/lib/data/catalog";

const initial: ActionState = { error: null, success: null };

export function ProductForm({
  initialValues,
  categories,
  suppliers,
  onSaved,
  canWrite,
}: {
  initialValues?: Partial<ProductRow>;
  categories: CategoryRow[];
  suppliers: SupplierRow[];
  onSaved?: () => void;
  canWrite: boolean;
}) {
  const [state, action, pending] = useActionState(saveProductAction, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const [isService, setIsService] = useState(initialValues?.type === "service");

  useEffect(() => {
    if (state.success && !initialValues?.id) {
      formRef.current?.reset();
    }
    if (state.success) onSaved?.();
  }, [state.success, initialValues?.id, onSaved]);

  const input = "mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-600";
  const activeCategories = categories.filter((c) => c.is_active || c.id === initialValues?.category_id);
  const activeSuppliers = suppliers.filter((s) => s.is_active || s.id === initialValues?.supplier_id);

  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-2">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}

      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold text-slate-700">Name</span>
        <input required name="name" defaultValue={initialValues?.name ?? ""} disabled={!canWrite} className={input} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">SKU (optional)</span>
        <input name="sku" defaultValue={initialValues?.sku ?? ""} disabled={!canWrite} className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Barcode (optional)</span>
        <input name="barcode" defaultValue={initialValues?.barcode ?? ""} disabled={!canWrite} className={input} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Category</span>
        <select name="category_id" defaultValue={initialValues?.category_id ?? ""} disabled={!canWrite} className={input}>
          <option value="">—</option>
          {activeCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.is_active ? "" : " (archived)"}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Supplier</span>
        <select name="supplier_id" defaultValue={initialValues?.supplier_id ?? ""} disabled={!canWrite} className={input}>
          <option value="">—</option>
          {activeSuppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.is_active ? "" : " (archived)"}
            </option>
          ))}
        </select>
      </label>

      <label className={`block ${isService ? "opacity-50" : ""}`}>
        <span className="text-sm font-semibold text-slate-700">
          Cost price (PKR){isService ? " — kept at 0 for services" : ""}
        </span>
        <input
          type="number"
          min={0}
          step="0.01"
          name="purchase_price"
          defaultValue={isService ? 0 : initialValues?.purchase_price ?? 0}
          disabled={!canWrite || isService}
          className={input}
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">
          {isService ? "Commission (PKR)" : "Sale price (PKR)"}
        </span>
        <input
          type="number"
          min={0}
          step="0.01"
          name="sale_price"
          defaultValue={initialValues?.sale_price ?? 0}
          disabled={!canWrite}
          className={input}
        />
      </label>

      <label className={`block ${isService ? "opacity-50" : ""}`}>
        <span className="text-sm font-semibold text-slate-700">Stock quantity</span>
        <input
          type="number"
          min={0}
          step="1"
          name="stock_quantity"
          defaultValue={initialValues?.stock_quantity ?? 0}
          disabled={!canWrite || isService}
          className={input}
        />
      </label>
      <label className={`block ${isService ? "opacity-50" : ""}`}>
        <span className="text-sm font-semibold text-slate-700">Reorder level</span>
        <input
          type="number"
          min={0}
          step="1"
          name="minimum_stock"
          defaultValue={initialValues?.minimum_stock ?? 0}
          disabled={!canWrite || isService}
          className={input}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold text-slate-700">Notes (optional)</span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={initialValues?.notes ?? ""}
          disabled={!canWrite}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-600"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_service"
          checked={isService}
          onChange={(e) => setIsService(e.currentTarget.checked)}
          disabled={!canWrite}
          className="size-4"
        />
        <span className="text-sm font-semibold text-slate-700">This is a service (no stock)</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={initialValues?.is_active ?? true}
          disabled={!canWrite}
          className="size-4"
        />
        <span className="text-sm font-semibold text-slate-700">Active</span>
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 sm:col-span-2">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 sm:col-span-2">{state.success}</p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending || !canWrite}
          className="h-10 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : initialValues?.id ? "Update product" : "Add product"}
        </button>
      </div>
    </form>
  );
}
