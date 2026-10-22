import { verifyAdminSession } from "@/lib/server/dal";
import { listOrders, type OrderRequest } from "@/lib/server/db";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/server/status-labels";
import SegmentedControl from "@/components/admin/SegmentedControl";
import { MobileCardList, MobileEmpty } from "@/components/admin/MobileCards";
import { formatRange, formatTimestamp } from "@/lib/format-date";
import { OrderCard } from "@/components/admin/ListCards";
import MobileSearchBar from "@/components/admin/MobileSearchBar";
import DesktopSearch from "@/components/admin/DesktopSearch";
import ClickableRow from "@/components/admin/ClickableRow";
import Link from "next/link";

function orderTotal(order: OrderRequest): number {
  const subtotal = order.items.reduce((sum, i) => sum + i.subtotal, 0);
  return Math.max(0, subtotal - (order.discount || 0));
}

function todayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; when?: string; sort?: string; from?: string; to?: string; min?: string; max?: string }>;
}) {
  await verifyAdminSession();
  const { q = "", status = "", when = "", sort = "", from = "", to = "", min = "", max = "" } = await searchParams;
  const today = todayString();
  const whenFilter = when === "pickup" || when === "return" ? when : "";
  const sortDir = sort === "asc" || sort === "desc" ? sort : "";

  const buildHref = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const base: Record<string, string> = { q, status, when: whenFilter, sort: sortDir, from, to, min, max, ...overrides };
    for (const [k, v] of Object.entries(base)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  const allOrders = await listOrders();

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

  // Date range (rental dates overlap) and amount range, applied before the status tabs
  const minAmount = min.trim() === "" ? null : Number(min);
  const maxAmount = max.trim() === "" ? null : Number(max);
  const scoped = searched.filter((o) => {
    if (from || to) {
      if (!o.rentalStartDate || !o.rentalEndDate) return false;
      if (from && o.rentalEndDate < from) return false;
      if (to && o.rentalStartDate > to) return false;
    }
    const total = orderTotal(o);
    if (minAmount !== null && Number.isFinite(minAmount) && total < minAmount) return false;
    if (maxAmount !== null && Number.isFinite(maxAmount) && total > maxAmount) return false;
    return true;
  });

  // "All" is the default tab (no status in the URL)
  const effectiveStatus = status || "ALL";
  const byStatus =
    effectiveStatus === "ALL" ? scoped : scoped.filter((order) => order.status === effectiveStatus);
  const byWhen = whenFilter
    ? byStatus.filter((o) =>
        whenFilter === "pickup" ? o.rentalStartDate === today : o.rentalEndDate === today
      )
    : byStatus;
  const sorted = sortDir
    ? [...byWhen].sort((a, b) => {
        const cmp = (a.rentalStartDate || "9999").localeCompare(b.rentalStartDate || "9999");
        return sortDir === "asc" ? cmp : -cmp;
      })
    : byWhen;
  // In "All", orders still waiting to be processed come first (otherwise keep the existing order)
  const filtered =
    effectiveStatus === "ALL" && !sortDir
      ? [...sorted].sort((a, b) => Number(b.status === "NEW") - Number(a.status === "NEW"))
      : sorted;

  const newCount = scoped.filter((o) => o.status === "NEW").length;
  const statusOptions = [
    { value: "ALL", label: "All", count: scoped.length },
    ...ORDER_STATUSES.map((s) => ({
      value: s,
      label: ORDER_STATUS_LABELS[s],
      count: scoped.filter((o) => o.status === s).length,
      dot: s === "NEW" && newCount > 0,
    })),
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-8">
        <h1 className="font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Order requests</h1>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs text-ash md:inline">
            {filtered.length} of {allOrders.length}
          </span>
          <Link
            href="/admin/orders/new"
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

      {whenFilter && (
        <div className="mb-4">
          <Link
            href={buildHref({ when: "" })}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 font-mono text-xs text-white"
          >
            {whenFilter === "pickup" ? "Today's pickups" : "Today's returns"}
            <span aria-hidden>✕</span>
            <span className="sr-only">Clear filter</span>
          </Link>
        </div>
      )}

      <div className="mb-3 md:hidden">
        <MobileSearchBar
          searchHref="/admin/orders/search"
          placeholder="Search customer or order #"
          q={q}
          keep={{ status, when: whenFilter, sort: sortDir, from, to, min, max }}
          filter={{ dateRange: { from, to }, amountRange: { min, max } }}
        />
      </div>

      <DesktopSearch
        placeholder="Search name, phone, email, order #"
        q={q}
        hidden={{ status, from, to, min, max, when: whenFilter, sort: sortDir }}
        clearHref={buildHref({ q: "" })}
      />

            <MobileCardList>
        {filtered.length === 0 ? (
          <MobileEmpty>No order requests found.</MobileEmpty>
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} today={today} />)
        )}
      </MobileCardList>

      <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-sm shadow-ink/5 md:block">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-ash/15 font-mono text-[10px] tracking-[0.08em] text-ash">
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">
                <Link
                  href={buildHref({ sort: sortDir === "asc" ? "desc" : sortDir === "desc" ? "" : "asc" })}
                  className="inline-flex items-center gap-1 hover:text-ink"
                  title="Sort by start date"
                >
                  Dates
                  <span className={sortDir ? "text-ink" : "text-ash/60"}>
                    {sortDir === "asc" ? "↑" : sortDir === "desc" ? "↓" : "↕"}
                  </span>
                </Link>
              </th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center font-mono text-xs text-ash">
                  No order requests found.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <ClickableRow key={order.id} href={`/admin/orders/${order.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-semibold">
                      {order.items[0]?.productName ?? "—"}
                      {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                    </div>
                    <div className="font-mono text-[11px] text-ash">#{order.orderNumber}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ash">
                    {formatTimestamp(order.submittedAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <div className="font-semibold">{order.customerName}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ash">
                    {formatRange(order.rentalStartDate, order.rentalEndDate)}
                    {order.status === "CONFIRMED" && (order.rentalStartDate === today || order.rentalEndDate === today) && (
                      <div className="mt-1 flex gap-1.5">
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
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    RM {orderTotal(order).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] ${ORDER_STATUS_STYLES[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
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
