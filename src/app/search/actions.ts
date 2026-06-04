"use server";

import { getCurrentContext } from "@/lib/auth/session";
import { searchGlobal, type SearchResult } from "@/lib/data/global-search";

export type GlobalSearchResponse = {
  results: SearchResult[];
  error?: string;
};

export async function executeGlobalSearchAction(
  searchTerm: string,
): Promise<GlobalSearchResponse> {
  try {
    const ctx = await getCurrentContext();
    if (!ctx.user || !ctx.profile?.organization_id) {
      return { results: [] };
    }

    const results = await searchGlobal(
      ctx.profile.organization_id,
      ctx.profile.role,
      searchTerm,
    );
    return { results };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to execute global search";
    return { results: [], error: message };
  }
}
