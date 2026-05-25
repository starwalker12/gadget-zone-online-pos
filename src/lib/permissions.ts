import type { ProfileRow } from "@/lib/auth/session";

export type Role = ProfileRow["role"];

const CATALOG_WRITERS: Role[] = ["owner", "admin", "manager"];

export function canWriteCatalog(role: Role | null | undefined): boolean {
  return role !== null && role !== undefined && CATALOG_WRITERS.includes(role);
}
