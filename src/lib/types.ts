export type UserRole = "owner" | "admin" | "manager" | "cashier" | "technician";

export type PaymentMethod =
  | "cash"
  | "card"
  | "easypaisa"
  | "jazzcash"
  | "bank_transfer"
  | "customer_credit";

export type InvoiceStatus = "draft" | "paid" | "partial" | "unpaid" | "void";

export type RepairStatus =
  | "received"
  | "waiting_for_parts"
  | "in_progress"
  | "completed"
  | "delivered"
  | "cancelled";

export type NavItem = {
  href: string;
  label: string;
  description: string;
};
