import { verifyAdminSession } from "@/lib/server/dal";
import { listOrders } from "@/lib/server/db";
import SearchShell from "@/components/admin/SearchShell";
import { OrderCard } from "@/components/admin/ListCards";

function todayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function OrderSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await verifyAdminSession();
  const { q = "" } = await searchParams;
  const needle = q.trim().toLowerCase();
  const results = needle
    ? (await listOrders()).filter(
        (o) =>
          o.customerName.toLowerCase().includes(needle) ||
          o.customerPhone.toLowerCase().includes(needle) ||
          o.customerEmail.toLowerCase().includes(needle) ||
          o.orderNumber.toLowerCase().includes(needle) ||
          o.items.some((i) => i.productName.toLowerCase().includes(needle))
      )
    : [];
  const today = todayString();

  return (
    <SearchShell
      placeholder="Customer, phone, order # or product"
      q={q}
      hint="You can search by customer name, phone, email, order number or product name"
      parent="/admin/orders"
      count={results.length}
    >
      <ul className="flex flex-col gap-3">
        {results.map((o) => (
          <OrderCard key={o.id} order={o} today={today} />
        ))}
      </ul>
    </SearchShell>
  );
}
