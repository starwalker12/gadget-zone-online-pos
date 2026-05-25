import { z } from "zod";

export const PAYMENT_METHODS = [
  "cash",
  "card",
  "easypaisa",
  "jazzcash",
  "bank_transfer",
  "customer_credit",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  unit_price: z.coerce.number().min(0, "Unit price must be 0 or more."),
  discount: z.coerce.number().min(0, "Line discount must be 0 or more.").default(0),
});
export type CartItemInput = z.infer<typeof cartItemSchema>;

export const checkoutSchema = z.object({
  cart: z.array(cartItemSchema).min(1, "Cart is empty."),
  customer_id: z.string().uuid().optional().nullable(),
  discount_total: z.coerce.number().min(0).default(0),
  payment_method: z.enum(PAYMENT_METHODS),
  amount_paid: z.coerce.number().min(0).default(0),
  payment_reference: z.string().trim().max(120).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const quickCustomerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required.").max(160),
  phone: z.string().trim().max(40).optional().nullable(),
});
export type QuickCustomerInput = z.infer<typeof quickCustomerSchema>;
