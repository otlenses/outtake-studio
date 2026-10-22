import { getAdminSession } from "@/lib/server/dal";
import { listEnquiries, listMerchOrders, listOrders } from "@/lib/server/db";
import Sidebar from "@/components/admin/Sidebar";
import TopBar, { type AdminNotification } from "@/components/admin/TopBar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return <div className="min-h-screen bg-smoke">{children}</div>;
  }

  const [orders, enquiries, merchOrders] = await Promise.all([
    listOrders(),
    listEnquiries(),
    listMerchOrders(),
  ]);

  const notifications: AdminNotification[] = [
    ...orders
      .filter((o) => o.status === "NEW")
      .map((o) => ({
        id: `order-${o.id}`,
        type: "order" as const,
        title: o.customerName,
        subtitle: `${o.orderNumber} · ${o.items.length} item${o.items.length === 1 ? "" : "s"}`,
        submittedAt: o.submittedAt,
        href: `/admin/orders/${o.id}`,
      })),
    ...enquiries
      .filter((e) => e.status === "NEW")
      .map((e) => ({
        id: `enquiry-${e.id}`,
        type: "enquiry" as const,
        title: e.name,
        subtitle: e.message,
        submittedAt: e.submittedAt,
        href: `/admin/enquiries/${e.id}`,
      })),
    ...merchOrders
      .filter((o) => o.status === "NEW")
      .map((o) => ({
        id: `merch-${o.id}`,
        type: "merch" as const,
        title: o.customerName,
        subtitle: `${o.orderNumber} · ${o.productName}`,
        submittedAt: o.submittedAt,
        href: `/admin/merch-orders/${o.id}`,
      })),
  ].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  const sidebarCounts = {
    orders: orders.filter((o) => o.status === "NEW").length,
    merchOrders: merchOrders.filter((o) => o.status === "NEW").length,
    enquiries: enquiries.filter((e) => e.status === "NEW").length,
  };

  return (
    <div className="admin-zoom flex min-h-screen bg-smoke">
      <Sidebar counts={sidebarCounts} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar email={session.email} notifications={notifications} counts={sidebarCounts} />
        <main className="flex-1 px-6 pb-24 pt-8">{children}</main>
      </div>
    </div>
  );
}
