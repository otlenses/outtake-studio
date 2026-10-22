import Link from "next/link";
import { formatDateTime } from "@/lib/format-date";
import { verifyAdminSession } from "@/lib/server/dal";
import { listEnquiries, listMerchOrders, listOrders } from "@/lib/server/db";
import { buildActivity, timeAgo } from "@/lib/server/activity";

export default async function ActivityPage() {
  await verifyAdminSession();
  const [orders, merchOrders, enquiries] = await Promise.all([listOrders(), listMerchOrders(), listEnquiries()]);
  const activity = buildActivity(orders, merchOrders, enquiries);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin" className="text-sm text-ash hover:text-ink">
        ← Dashboard
      </Link>
      <h1 className="mt-2 mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold text-ink">Recent activity</h1>
      <section className="rounded-2xl border border-ash/15 bg-white p-6">
        {activity.length === 0 ? (
          <p className="text-sm text-ash">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-ash/15">
            {activity.map((a) => (
              <li key={a.key}>
                <Link href={a.href} className="flex items-start justify-between gap-3 py-3 transition-colors hover:bg-smoke/60">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{a.title}</span>
                    <span className="block truncate text-xs text-ash">{a.detail}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs text-ash">
                    {timeAgo(a.at)}
                    <span className="block text-[11px] text-ash/70">{formatDateTime(a.at)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
