import { MobileCard } from "./MobileCards";
import { formatRange, formatTimestamp } from "@/lib/format-date";
import {
  ENQUIRY_STATUS_LABELS,
  MERCH_ORDER_STATUS_LABELS,
  MERCH_ORDER_STATUS_STYLES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/lib/server/status-labels";
import type { Enquiry, EnquiryStatus, MerchOrder, OrderRequest } from "@/lib/server/db";

const ENQUIRY_STATUS_STYLES: Record<EnquiryStatus, string> = {
  NEW: "bg-signal/20 text-ink",
  Replied: "bg-emerald-100 text-emerald-800",
};

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 3v3M16 3v3" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ash" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function orderTotal(order: OrderRequest): number {
  const subtotal = order.items.reduce((sum, i) => sum + i.subtotal, 0);
  return Math.max(0, subtotal - (order.discount || 0));
}

/** Phone card for an order request (shared by the list and the search page) */
export function OrderCard({ order, today }: { order: OrderRequest; today: string }) {
  return (
    <MobileCard href={`/admin/orders/${order.id}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-ash">#{order.orderNumber}</span>
        <span
          className={`inline-flex shrink-0 rounded-full px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] max-md:!text-[12px] ${ORDER_STATUS_STYLES[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      <p className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">
        {order.items[0]?.productName ?? "—"}
        {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
      </p>
      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-ash/15 pt-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{order.customerName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ash">
            <CalendarIcon />
            {formatRange(order.rentalStartDate, order.rentalEndDate)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[15px] font-semibold text-ink">RM {orderTotal(order).toFixed(2)}</span>
          <Chevron />
        </div>
      </div>
      {order.status === "CONFIRMED" && (order.rentalStartDate === today || order.rentalEndDate === today) && (
        <div className="mt-2 flex gap-1.5">
          {order.rentalStartDate === today && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Pickup today
            </span>
          )}
          {order.rentalEndDate === today && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              Return today
            </span>
          )}
        </div>
      )}
    </MobileCard>
  );
}

export function MerchOrderCard({ order }: { order: MerchOrder }) {
  return (
    <MobileCard href={`/admin/merch-orders/${order.id}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-ash">#{order.orderNumber}</span>
        <span
          className={`inline-flex shrink-0 rounded-full px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] max-md:!text-[12px] ${MERCH_ORDER_STATUS_STYLES[order.status]}`}
        >
          {MERCH_ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      <p className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">{order.productName}</p>
      <p className="mt-0.5 text-xs text-ash">
        {order.size ? `Size ${order.size} × ${order.quantity}` : `Qty ${order.quantity}`}
      </p>
      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-ash/15 pt-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{order.customerName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ash">
            <CalendarIcon />
            {formatTimestamp(order.submittedAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-[15px] font-semibold text-ink">RM {order.subtotal.toFixed(2)}</span>
          <Chevron />
        </div>
      </div>
    </MobileCard>
  );
}

export function EnquiryCard({ enquiry }: { enquiry: Enquiry }) {
  return (
    <MobileCard href={`/admin/enquiries/${enquiry.id}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-ash">{formatTimestamp(enquiry.submittedAt)}</span>
        <span
          className={`inline-flex shrink-0 rounded-full px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] max-md:!text-[12px] ${ENQUIRY_STATUS_STYLES[enquiry.status]}`}
        >
          {ENQUIRY_STATUS_LABELS[enquiry.status]}
        </span>
      </div>
      <p className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">{enquiry.name}</p>
      <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-ash/15 pt-2.5">
        <p className="line-clamp-2 min-w-0 text-sm text-ink/80">{enquiry.message}</p>
        <Chevron />
      </div>
    </MobileCard>
  );
}
