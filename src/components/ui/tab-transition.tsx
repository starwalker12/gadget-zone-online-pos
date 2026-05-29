"use client";

import { useEffect, useRef, useState } from "react";

export function TabTransition({
  currentTab,
  fallback,
  children,
}: {
  currentTab: string;
  fallback: React.ReactNode;
  children: React.ReactNode;
}) {
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const prevTab = useRef(currentTab);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (prevTab.current !== currentTab) {
      prevTab.current = currentTab;
      setPendingTab(currentTab);
      const timer = setTimeout(() => setPendingTab(null), 200);
      return () => clearTimeout(timer);
    }
  }, [currentTab]);

  if (pendingTab) return fallback;
  return children;
}
