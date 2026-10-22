import type { Enquiry, MerchOrder, OrderRequest } from "./db";

export type Activity = {
  key: string;
  title: string;
  detail: string;
  at: string;
  href: string;
};

export function buildActivity(orders: OrderRequest[], merchOrders: MerchOrder[], enquiries: Enquiry[]): Activity[] {
  return [
    ...orders.flatMap((o) =>
      (o.orderHistory ?? []).map((h) => ({
        key: `o-${o.id}-${h.id}`,
        title: h.title,
        detail: `${o.orderNumber} · ${o.customerName}`,
        at: h.at,
        href: `/admin/orders/${o.id}`,
      }))
    ),
    ...merchOrders.flatMap((o) =>
      (o.orderHistory ?? []).map((h) => ({
        key: `m-${o.id}-${h.id}`,
        title: h.title,
        detail: `${o.orderNumber} · ${o.productName}`,
        at: h.at,
        href: `/admin/merch-orders/${o.id}`,
      }))
    ),
    ...enquiries.map((e) => ({
      key: `e-${e.id}`,
      title: "Enquiry received",
      detail: e.name,
      at: e.submittedAt,
      href: `/admin/enquiries/${e.id}`,
    })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}
