"use client";

import { useCallback, startTransition, useOptimistic, type ComponentType } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Settings, UserCircle, Shield, Database, Archive, ShieldCheck, HelpCircle,
} from "lucide-react";
import { TabSkeleton } from "@/components/settings/tab-skeleton";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  general: Settings,
  accounts: UserCircle,
  privacy: Shield,
  "demo-data": Database,
  backup: Archive,
  security: ShieldCheck,
  help: HelpCircle,
};

export type TabDef = {
  id: string;
  label: string;
  icon: string;
};

export function SettingsTabShell({
  currentTab,
  tabs,
  heading,
  description,
  children,
}: {
  currentTab: string;
  tabs: TabDef[];
  heading: string;
  description: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [optimisticTab, setOptimisticTab] = useOptimistic(
    currentTab,
    (_curr, next: string) => next,
  );

  const goToTab = useCallback(
    (tabId: string) => {
      if (tabId === currentTab) return;
      startTransition(() => {
        setOptimisticTab(tabId);
        router.push(`${pathname}?tab=${tabId}`);
      });
    },
    [currentTab, pathname, router, setOptimisticTab],
  );

  const showSkeleton = optimisticTab !== currentTab;
  const activeTab = optimisticTab;

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-[#fff] p-3 shadow-sm md:space-y-6 md:rounded-2xl md:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-xl font-black text-slate-950 md:text-2xl dark:text-slate-50">{heading}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 md:mt-2 md:text-sm md:leading-6 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-950 md:border-b md:border-slate-200 md:bg-transparent md:p-0 md:pb-px dark:md:border-slate-700">
          {tabs.map((tab) => {
            const Icon = iconMap[tab.icon];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => goToTab(tab.id)}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg border-b-0 px-3 py-2 text-xs font-bold transition duration-200 md:rounded-t-xl md:border-b-2 md:px-4 md:py-3 md:text-sm ${
                  isActive
                    ? "bg-[#fff] text-[var(--primary-accent-bg)] shadow-sm md:border-[var(--primary-accent-bg)] md:bg-[var(--primary-accent-soft)] md:shadow-none dark:bg-slate-900 dark:text-slate-100 dark:md:bg-[var(--primary-accent-soft)] dark:md:text-[var(--primary-accent-bg)]"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:border-slate-700"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showSkeleton ? <TabSkeleton tabId={optimisticTab} /> : children}
    </div>
  );
}
