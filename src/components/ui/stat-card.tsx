import type { ReactNode } from "react";

export type StatCardTone = "neutral" | "info" | "success" | "warning" | "danger";

export const STAT_CARD_TONE_STYLES: Record<
  StatCardTone,
  { card: string; label: string; value: string; detail: string; icon: string }
> = {
  neutral: {
    card: "border-[#cbd5e1] bg-[#f1f5f9] dark:border-[rgba(226,232,240,0.18)] dark:bg-[rgba(30,41,59,0.50)]",
    label: "text-slate-600 dark:text-slate-300",
    value: "text-slate-700 dark:text-slate-200",
    detail: "text-slate-500 dark:text-slate-400",
    icon: "bg-[#e2e8f0] text-slate-700 dark:bg-[rgba(226,232,240,0.12)] dark:text-slate-200",
  },
  info: {
    card: "border-[#bfdbfe] bg-[#eff6ff] dark:border-[rgba(147,197,253,0.30)] dark:bg-[rgba(30,64,175,0.30)]",
    label: "text-blue-800 dark:text-blue-200",
    value: "text-blue-700 dark:text-blue-300",
    detail: "text-blue-600 dark:text-blue-300/80",
    icon: "bg-[#dbeafe] text-blue-700 dark:bg-[rgba(147,197,253,0.14)] dark:text-blue-300",
  },
  success: {
    card: "border-[#bbf7d0] bg-[#f0fdf4] dark:border-[rgba(134,239,172,0.30)] dark:bg-[rgba(20,83,45,0.30)]",
    label: "text-green-800 dark:text-green-200",
    value: "text-green-700 dark:text-green-300",
    detail: "text-green-600 dark:text-green-300/80",
    icon: "bg-[#dcfce7] text-green-700 dark:bg-[rgba(134,239,172,0.14)] dark:text-green-300",
  },
  warning: {
    card: "border-[#fde68a] bg-[#fffbeb] dark:border-[rgba(252,211,77,0.30)] dark:bg-[rgba(120,53,15,0.30)]",
    label: "text-amber-800 dark:text-amber-200",
    value: "text-amber-700 dark:text-amber-300",
    detail: "text-amber-600 dark:text-amber-300/80",
    icon: "bg-[#fef3c7] text-amber-700 dark:bg-[rgba(252,211,77,0.14)] dark:text-amber-300",
  },
  danger: {
    card: "border-[#fecaca] bg-[#fef2f2] dark:border-[rgba(252,165,165,0.30)] dark:bg-[rgba(127,29,29,0.30)]",
    label: "text-red-800 dark:text-red-200",
    value: "text-red-700 dark:text-red-300",
    detail: "text-red-600 dark:text-red-300/80",
    icon: "bg-[#fee2e2] text-red-700 dark:bg-[rgba(252,165,165,0.14)] dark:text-red-300",
  },
};

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: StatCardTone;
}) {
  const toneStyles = tone ? STAT_CARD_TONE_STYLES[tone] : null;

  return (
    <div className={`rounded-xl border p-3 shadow-sm md:rounded-2xl md:p-5 ${toneStyles?.card ?? "border-slate-200 bg-[#fff] dark:bg-[#0b1220]"}`}>
      <div className="flex min-w-0 items-start justify-between gap-2 md:gap-4">
        <div className="min-w-0">
          <p className={`truncate text-xs font-semibold md:text-sm ${toneStyles?.label ?? "text-slate-500"}`}>{label}</p>
          <p className={`mt-1 break-words text-lg font-black leading-tight md:mt-2 md:text-2xl ${toneStyles?.value ?? "text-slate-950"}`}>{value}</p>
        </div>
        <div className={`shrink-0 rounded-lg p-2 md:rounded-xl md:p-3 ${toneStyles?.icon ?? "bg-[#eff6ff] text-blue-700 dark:bg-[rgba(255,255,255,0.08)] dark:text-[#22d3ee]"}`}>{icon}</div>
      </div>
      <p className={`mt-2 text-xs leading-snug md:mt-4 md:text-sm ${toneStyles?.detail ?? "text-slate-500"}`}>{detail}</p>
    </div>
  );
}
