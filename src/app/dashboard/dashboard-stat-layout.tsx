"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { LayoutGrid, Check, RotateCcw, Plus, ShoppingCart } from "lucide-react";
import { WidgetGrid, getWidgetDimsFromSize } from "./widgets/widget-grid";
import { WidgetGallery } from "./widgets/widget-gallery";
import { WIDGET_CATALOG, WidgetColor, WidgetSize } from "./widgets/widget-registry";
import {
  DASHBOARD_KEY,
  DASHBOARD_EVENT,
  saveDashboardLayout,
  useUIPreferencesSync,
} from "@/lib/use-ui-preferences";

export type DashboardLayoutLabels = {
  editLayout: string;
  done: string;
  resetLayout: string;
  dragToReorder: string;
  moveEarlier: string;
  moveLater: string;
  cardSize: string;
  setCardSize: string;
  small: string;
  medium: string;
  large: string;
};

type WidgetInstance = {
  id: string;
  type: string;
  size: WidgetSize;
  color: WidgetColor;
  x: number;
  y: number;
  w: number;
  h: number;
};

// Default layout matching the current dashboard cards and sections
const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: "widget-today-profit", type: "today-profit", size: "S", color: "success", x: 0, y: 0, w: 1, h: 1 },
  { id: "widget-gross-sales", type: "gross-sales", size: "S", color: "success", x: 1, y: 0, w: 1, h: 1 },
  { id: "widget-returns", type: "returns", size: "S", color: "danger", x: 2, y: 0, w: 1, h: 1 },
  { id: "widget-expenses", type: "expenses", size: "S", color: "danger", x: 3, y: 0, w: 1, h: 1 },
  { id: "widget-low-stock", type: "low-stock", size: "S", color: "warning", x: 0, y: 1, w: 1, h: 1 },
  { id: "widget-pending-repairs", type: "pending-repairs", size: "S", color: "warning", x: 1, y: 1, w: 1, h: 1 },
  { id: "widget-supplier-dues", type: "supplier-dues", size: "S", color: "warning", x: 2, y: 1, w: 1, h: 1 },
  { id: "widget-customer-dues", type: "customer-dues", size: "S", color: "warning", x: 3, y: 1, w: 1, h: 1 },
  { id: "widget-weekly-sales", type: "weekly-sales", size: "M", color: "info", x: 0, y: 2, w: 2, h: 1 },
  { id: "widget-monthly-sales", type: "monthly-sales", size: "M", color: "info", x: 2, y: 2, w: 2, h: 1 },
  { id: "widget-top-selling-products", type: "top-selling-products", size: "L", color: "neutral", x: 0, y: 3, w: 4, h: 2 },
  { id: "widget-recent-activity", type: "recent-activity", size: "L", color: "neutral", x: 0, y: 5, w: 4, h: 2 },
  { id: "widget-credit-collected-today", type: "credit-collected-today", size: "S", color: "success", x: 0, y: 7, w: 1, h: 1 },
  { id: "widget-today-net", type: "today-net", size: "S", color: "success", x: 1, y: 7, w: 1, h: 1 },
  { id: "widget-today-closing", type: "today-closing", size: "S", color: "neutral", x: 2, y: 7, w: 1, h: 1 },
  { id: "widget-today-expenses", type: "today-expenses", size: "S", color: "danger", x: 3, y: 7, w: 1, h: 1 },
  { id: "widget-stock-valuation", type: "stock-valuation", size: "S", color: "neutral", x: 0, y: 8, w: 1, h: 1 },
  { id: "widget-potential-profit-in-stock", type: "potential-profit-in-stock", size: "M", color: "warning", x: 1, y: 8, w: 3, h: 1 },
];

function getLayoutSnapshot(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(DASHBOARD_KEY) ?? "";
  } catch {
    return "";
  }
}

function getServerLayoutSnapshot(): string {
  return "";
}

function subscribeToLayout(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === DASHBOARD_KEY) onStoreChange();
  };
  const handleLocalChange = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(DASHBOARD_EVENT, handleLocalChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(DASHBOARD_EVENT, handleLocalChange);
  };
}

export function DashboardStatLayout({
  firstName,
  role,
  organizationName,
  labels,
  widgetData,
}: {
  cards?: any[]; // kept for compatibility if needed
  firstName: string;
  role: string;
  organizationName: string;
  labels: DashboardLayoutLabels;
  widgetData: any;
}) {
  // Sync preferences with database on mount (fail-open)
  useUIPreferencesSync();

  const layoutSnapshot = useSyncExternalStore(
    subscribeToLayout,
    getLayoutSnapshot,
    getServerLayoutSnapshot
  );

  const widgets = useMemo(() => {
    try {
      if (!layoutSnapshot) return DEFAULT_WIDGETS;
      const parsed = JSON.parse(layoutSnapshot);
      if (Array.isArray(parsed)) return parsed as WidgetInstance[];
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.order)) {
        // Fallback for legacy layout object structure if found
        return DEFAULT_WIDGETS;
      }
      return DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  }, [layoutSnapshot]);

  const [editing, setEditing] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleUpdateWidgets = (updated: WidgetInstance[]) => {
    saveDashboardLayout(updated);
  };

  const handleAddWidget = (type: string) => {
    const catalogItem = WIDGET_CATALOG.find((w) => w.type === type);
    if (!catalogItem) return;

    // Find next available coordinate (append to bottom)
    const maxY = widgets.reduce((max, w) => Math.max(max, w.y + w.h), 0);
    const dims = getWidgetDimsFromSize(catalogItem.defaultSize);

    const newWidget: WidgetInstance = {
      id: `widget-${type}-${Date.now()}`,
      type,
      size: catalogItem.defaultSize,
      color: catalogItem.defaultColor,
      x: 0,
      y: maxY,
      w: dims.w,
      h: dims.h,
    };

    handleUpdateWidgets([...widgets, newWidget]);
  };

  const handleResetLayout = () => {
    saveDashboardLayout(DEFAULT_WIDGETS);
    setResetModalOpen(false);
  };

  const addedWidgetTypes = useMemo(() => {
    return new Set(widgets.map((w) => w.type));
  }, [widgets]);

  const stateForWidgets = {
    ...widgetData,
    labels,
  };

  return (
    <>
      {/* Dashboard Welcome Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-950 dark:text-white">
            Welcome, {firstName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase dark:bg-white/[0.08] dark:text-slate-300">
              {role}
            </span>
            {" · "}
            {organizationName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editing && (
            <>
              <button
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs font-bold transition shadow-sm focus:outline-none"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add Widget
              </button>
              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 text-xs font-bold text-slate-600 transition hover:bg-[#eef2f7] focus:outline-none dark:border-white/[0.10] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {labels.resetLayout}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setEditing((current) => !current)}
            aria-pressed={editing}
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold shadow-sm transition focus:outline-none ${
              editing
                ? "bg-[#15803d] text-white hover:bg-[#166534] dark:bg-[#16a34a] dark:hover:bg-[#15803d]"
                : "border border-slate-200 bg-[#f8fafc] text-slate-700 hover:bg-[#eef2f7] dark:border-white/[0.10] dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            }`}
          >
            {editing ? <Check className="size-3.5" aria-hidden="true" /> : <LayoutGrid className="size-3.5" aria-hidden="true" />}
            {editing ? labels.done : labels.editLayout}
          </button>
          <Link
            href="/pos"
            className="hidden h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0b2f6f] to-[#0891b2] px-4 text-xs font-bold text-white shadow-sm transition hover:opacity-90 sm:inline-flex"
          >
            <ShoppingCart className="size-3.5" aria-hidden="true" />
            New sale
          </Link>
        </div>
      </div>

      {/* Responsive Widget Grid */}
      <div className={editing ? "rounded-2xl border border-dashed border-blue-200 bg-[#eff6ff]/40 p-2 dark:border-blue-400/20 dark:bg-blue-950/10" : ""}>
        <WidgetGrid
          widgets={widgets}
          onChangeWidgets={handleUpdateWidgets}
          editing={editing}
          state={stateForWidgets}
        />
      </div>

      {/* Widget Gallery Side Drawer */}
      <WidgetGallery
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onAddWidget={(type) => {
          handleAddWidget(type);
          setGalleryOpen(false);
        }}
        addedWidgetTypes={addedWidgetTypes}
      />

      {/* Themed Reset Confirm Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#fff] dark:bg-[#0b1220] p-5 shadow-xl text-center animate-fade-in mx-4">
            <h3 className="text-base font-black text-slate-950 dark:text-white">Restore Default Layout?</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to reset your dashboard layout? This will revert all widgets, sizes, and colors back to defaults.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetLayout}
                className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
