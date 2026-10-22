import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { listEnquiries, listGearProducts, listMerchOrders, listOrders, type OrderRequest } from "@/lib/server/db";
import { buildActivity, timeAgo } from "@/lib/server/activity";
import { CalendarIcon, EnquiriesIcon, MerchIcon, OrdersIcon } from "@/components/admin/icons";

function todayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isActiveToday(order: OrderRequest, today: string): boolean {
  if (order.status !== "CONFIRMED" || !order.rentalStartDate || !order.rentalEndDate) return false;
  return order.rentalStartDate <= today && today <= order.rentalEndDate;
}

export default async function AdminDashboardPage() {
  await verifyAdminSession();

  const [orders, enquiries, merchOrders, gearProducts] = await Promise.all([
    listOrders(),
    listEnquiries(),
    listMerchOrders(),
    listGearProducts(),
  ]);

  const today = todayString();
  const dateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const newOrders = orders.filter((o) => (o.status || "NEW") === "NEW");
  const newEnquiries = enquiries.filter((e) => (e.status || "NEW") === "NEW");
  const newMerchOrders = merchOrders.filter((o) => (o.status || "NEW") === "NEW");
  const attentionTotal = newOrders.length + newEnquiries.length + newMerchOrders.length;

  const attentionRows = [
    {
      key: "orders",
      href: "/admin/orders?status=NEW",
      icon: <OrdersIcon />,
      title: "New order requests",
      subtitle: `${newOrders.length} order${newOrders.length === 1 ? "" : "s"} waiting for review`,
      count: newOrders.length,
    },
    {
      key: "enquiries",
      href: "/admin/enquiries?status=NEW",
      icon: <EnquiriesIcon />,
      title: "New enquiries",
      subtitle: `${newEnquiries.length} enquir${newEnquiries.length === 1 ? "y" : "ies"} waiting for reply`,
      count: newEnquiries.length,
    },
    {
      key: "merch",
      href: "/admin/merch-orders?status=NEW",
      icon: <MerchIcon />,
      title: "New merch orders",
      subtitle: `${newMerchOrders.length} order${newMerchOrders.length === 1 ? "" : "s"} waiting for review`,
      count: newMerchOrders.length,
    },
  ].filter((r) => r.count > 0);

  const pickups = orders.filter((o) => o.status === "CONFIRMED" && o.rentalStartDate === today);
  const returns = orders.filter((o) => o.status === "CONFIRMED" && o.rentalEndDate === today);

  const rentedProductIds = new Set(
    orders.filter((o) => isActiveToday(o, today)).flatMap((o) => o.items.map((i) => i.productId).filter(Boolean))
  );
  const enabledGear = gearProducts.filter((g) => g.isEnabled);
  const availableToday = enabledGear.filter((g) => !rentedProductIds.has(g.id));

  const activity = buildActivity(orders, merchOrders, enquiries).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ash">Here&apos;s what needs your attention today.</p>
        </div>
        <span className="text-sm text-ash">{dateLabel}</span>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
        {/* Needs attention — primary focus */}
        <section className="rounded-2xl border border-ash/15 bg-white p-4 md:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink md:text-xl">
                Needs attention
                {attentionTotal > 0 && (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-bold text-red-600">
                    {attentionTotal}
                  </span>
                )}
              </h2>
              <p className="mt-0.5 text-sm text-ash">Items requiring your action</p>
            </div>
          </div>
          {attentionRows.length === 0 ? (
            <p className="rounded-xl bg-smoke px-4 py-5 text-sm text-ash">You&apos;re all caught up — nothing needs action.</p>
          ) : (
            <ul className="divide-y divide-ash/15 border-t border-ash/15">
              {attentionRows.map((row) => (
                <li key={row.key}>
                  <Link href={row.href} className="group flex items-center gap-4 py-4 transition-colors hover:bg-smoke/60">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-smoke text-ink">
                      {row.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[15px] font-semibold text-ink">{row.title}</span>
                      <span className="block text-sm text-ash">{row.subtitle}</span>
                    </span>
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-red-50 px-2 text-sm font-bold text-red-600">
                      {row.count}
                    </span>
                    <Chevron />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Today's rental activity */}
        <section className="rounded-2xl border border-ash/15 bg-white p-4 md:p-6">
          <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-ink">
            <CalendarIcon />
            Today&apos;s rental activity
          </h2>
          <div className="divide-y divide-ash/15 border-t border-ash/15">
            <ActivityGroup title="Pickups" subtitle="Rentals starting today" orders={pickups} dateKey="rentalStartDate" />
            <ActivityGroup title="Returns" subtitle="Rentals due today" orders={returns} dateKey="rentalEndDate" />
          </div>
        </section>

        </div>

        <div className="flex flex-col gap-6">
        {/* Quick overview — secondary */}
        <section className="rounded-2xl border border-ash/15 bg-white p-4 md:p-6">
          <h2 className="mb-4 text-lg font-bold text-ink">Quick overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              href="/admin/orders?status=NEW"
              label="Needs attention"
              value={attentionTotal}
              hint="items"
              alert={attentionTotal > 0}
            />
            <MiniStat href="/admin/orders?status=CONFIRMED&when=pickup" label="Today's pickups" value={pickups.length} hint="rentals" />
            <MiniStat href="/admin/orders?status=CONFIRMED&when=return" label="Today's returns" value={returns.length} hint="rentals" />
            <MiniStat
              href="/admin/availability"
              label="Gear available"
              value={availableToday.length}
              total={enabledGear.length}
              hint="items"
              quiet
            />
          </div>
        </section>

        {/* Recent activity */}
        <section className="rounded-2xl border border-ash/15 bg-white p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-ink">Recent activity</h2>
            <Link href="/admin/activity" className="text-xs text-ash underline-offset-2 hover:text-ink hover:underline">
              View all
            </Link>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-ash">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-ash/15 border-t border-ash/15">
              {activity.map((a) => (
                <li key={a.key}>
                  <Link href={a.href} className="flex items-start justify-between gap-3 py-3 transition-colors hover:bg-smoke/60">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{a.title}</span>
                      <span className="block truncate text-xs text-ash">{a.detail}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ash">{timeAgo(a.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ash transition-transform group-hover:translate-x-0.5">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniStat({
  href,
  label,
  value,
  total,
  hint,
  alert,
  quiet,
}: {
  href: string;
  label: string;
  value: number;
  total?: number;
  hint: string;
  alert?: boolean;
  quiet?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-3.5 transition-colors hover:border-ink/30 ${
        alert ? "border-red-100 bg-red-50/60" : "border-ash/15 bg-smoke/40"
      }`}
    >
      <span className={`block text-xs ${alert ? "text-red-600" : "text-ash"}`}>{label}</span>
      <span className="mt-1 flex items-baseline gap-1">
        <span className={`font-display font-black ${quiet ? "text-xl text-ink/80" : "text-2xl text-ink"} ${alert ? "!text-red-600" : ""}`}>
          {value}
        </span>
        {total !== undefined && <span className="text-xs text-ash">/ {total}</span>}
      </span>
      <span className="block text-xs text-ash">{hint}</span>
    </Link>
  );
}

function ActivityGroup({
  title,
  subtitle,
  orders,
}: {
  title: string;
  subtitle: string;
  orders: OrderRequest[];
  dateKey: "rentalStartDate" | "rentalEndDate";
}) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-ink">{title}</p>
          <p className="text-sm text-ash">{subtitle}</p>
        </div>
        <span className={`font-display text-2xl font-black ${orders.length > 0 ? "text-ink" : "text-ash/50"}`}>
          {orders.length}
        </span>
      </div>
      {orders.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="group flex items-center justify-between gap-3 rounded-lg bg-smoke/60 px-3 py-2.5 transition-colors hover:bg-smoke"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{o.customerName}</span>
                  <span className="block truncate text-xs text-ash">
                    {o.orderNumber} · {o.items[0]?.productName ?? "—"}
                    {o.items.length > 1 ? ` +${o.items.length - 1} more` : ""}
                  </span>
                </span>
                <Chevron />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
