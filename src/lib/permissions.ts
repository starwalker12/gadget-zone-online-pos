import type { ProfileRow } from "@/lib/auth/session";

export type Role = ProfileRow["role"];

const CATALOG_WRITERS: Role[] = ["owner", "admin", "manager"];
const POS_USERS: Role[] = ["owner", "admin", "manager", "cashier"];

export function canWriteCatalog(role: Role | null | undefined): boolean {
  return role !== null && role !== undefined && CATALOG_WRITERS.includes(role);
}

export function canUsePos(role: Role | null | undefined): boolean {
  return role !== null && role !== undefined && POS_USERS.includes(role);
}
