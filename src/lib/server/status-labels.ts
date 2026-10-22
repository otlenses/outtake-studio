import type { EnquiryStatus, MerchOrderStatus, OrderStatus } from "./db";

// Display labels only — internal status VALUES stay unchanged (CONFIRMED etc.)
// so existing data and status-timestamp logic don't need to migrate.
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "To process",
  CONFIRMED: "Booked",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUSES: OrderStatus[] = ["NEW", "CONFIRMED", "COMPLETED", "CANCELLED"];

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  NEW: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
};

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "To process",
  Replied: "Replied",
};

export const ENQUIRY_STATUSES: EnquiryStatus[] = ["NEW", "Replied"];

export const MERCH_ORDER_STATUS_LABELS: Record<MerchOrderStatus, string> = {
  NEW: "To process",
  PAYMENT_VERIFIED: "Awaiting pickup",
  FULFILLED: "Completed",
  CANCELLED: "Cancelled",
};

export const MERCH_ORDER_STATUSES: MerchOrderStatus[] = [
  "NEW",
  "PAYMENT_VERIFIED",
  "FULFILLED",
  "CANCELLED",
];

export const MERCH_ORDER_STATUS_STYLES: Record<MerchOrderStatus, string> = {
  NEW: "bg-amber-100 text-amber-800",
  PAYMENT_VERIFIED: "bg-blue-100 text-blue-800",
  FULFILLED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
};
