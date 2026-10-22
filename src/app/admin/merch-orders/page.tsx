import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { listMerchOrders } from "@/lib/server/db";
import {
  MERCH_ORDER_STATUSES,
  MERCH_ORDER_STATUS_LABELS,
  MERCH_ORDER_STATUS_STYLES,
} from "@/lib/server/status-labels";
import SegmentedControl from "@/components/admin/SegmentedControl";
import { MobileCardList, MobileEmpty } from "@/components/admin/MobileCards";
import { formatTimestamp } from "@/lib/format-date";
import { MerchOrderCard } from "@/components/admin/ListCards";
import MobileSearchBar from "@/components/admin/MobileSearchBar";
import DesktopSearch from "@/components/admin/DesktopSearch";
import ClickableRow from "@/components/admin/ClickableRow";

/** Local calendar day of an ISO timestamp, as yyyy-mm-dd */
function localDay(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function AdminMerchOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string; min?: string; max?: string }>;
}) {
  await verifyAdminSession();
  const { q = "", status = "", from = "", to = "", min = "", max = "" } = await searchParams;

  const allOrders = await listMerchOrders();

  const searched = allOrders.filter((order) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return (
      order.customerName.toLowerCase().includes(needle) ||
      order.customerPhone.toLowerCase().includes(needle) ||
      order.customerEmail.toLowerCase().includes(needle) ||
      order.orderNumber.toLowerCase().includes(needle)
    );
  });

  // Order-date range and amount range, applied before the status tabs
  const minAmount = min.trim() === "" ? null : Number(min);
  const maxAmount = max.trim() === "" ? null : Number(max);
  const scoped = searched.filter((o) => {
    const day = localDay(o.submittedAt);
    if (from && day < from) return false;
    if (to && day > to) return false;
    if (minAmount !== null && Number.isFinite(minAmount) && o.subtotal < minAmount) return false;
    if (maxAmount !== null && Number.isFinite(maxAmount) && o.subtotal > maxAmount) return false;
    return true;
  });

  // "All" is the default tab (no status in the URL); orders still to process come first there
  const effectiveStatus = status || "ALL";
  const filtered =
    effectiveStatus === "ALL"
      ? [...scoped].sort((a, b) => Number(b.status === "NEW") - Number(a.status === "NEW"))
      : scoped.filter((order) => order.status === effectiveStatus);

  const newCount = scoped.filter((o) => o.status === "NEW").length;
  const statusOptions = [
    { value: "ALL", label: "All", count: scoped.length },
    ...MERCH_ORDER_STATUSES.map((s) => ({
      value: s,
      label: MERCH_ORDER_STATUS_LABELS[s],
      count: scoped.filter((o) => o.status === s).length,
      dot: s === "NEW" && newCount > 0,
    })),
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-8">
        <h1 className="font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Merch orders</h1>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs text-ash md:inline">
            {filtered.length} of {allOrders.length}
          </span>
          <Link
            href="/admin/merch-orders/new"
            className="whitespace-nowrap rounded-full bg-signal px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-ink transition-transform hover:scale-[1.02] md:px-5"
          >
            <span className="md:hidden">+ Add</span>
            <span className="hidden md:inline">+ Add order</span>
          </Link>
        </div>
      </div>

      <div className="mb-3 md:mb-5">
        <SegmentedControl options={statusOptions} />
      </div>

      <div className="mb-3 md:hidden">
        <MobileSearchBar
          searchHref="/admin/merch-orders/search"
          placeholder="Search customer or order #"
          q={q}
          keep={{ status, from, to, min, max }}
          filter={{ dateRange: { from, to, label: "Order date range" }, amountRange: { min, max } }}
        />
      </div>

      <DesktopSearch
        placeholder="Search name, phone, email, order #"
        q={q}
        hidden={{ status, from, to, min, max }}
        clearHref={status ? `/admin/merch-orders?status=${status}` : "/admin/merch-orders"}
      />

            <MobileCardList>
        {filtered.length === 0 ? (
          <MobileEmpty>No merch orders found.</MobileEmpty>
        ) : (
          filtered.map((order) => <MerchOrderCard key={order.id} order={order} />)
        )}
      </MobileCardList>

      <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm shadow-ink/5 md:block">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-ash/15 font-mono text-[10px] tracking-[0.08em] text-ash">
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center font-mono text-xs text-ash">
                  No merch orders found.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <ClickableRow key={order.id} href={`/admin/merch-orders/${order.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-semibold">{order.productName}</div>
                    <div className="font-mono text-[11px] text-ash">
                      #{order.orderNumber} · {order.size} × {order.quantity}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ash">
                    {formatTimestamp(order.submittedAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <div className="font-semibold">{order.customerName}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    RM {order.subtotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] ${MERCH_ORDER_STATUS_STYLES[order.status]}`}
                    >
                      {MERCH_ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
