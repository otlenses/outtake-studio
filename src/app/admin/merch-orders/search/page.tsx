import { verifyAdminSession } from "@/lib/server/dal";
import { listMerchOrders } from "@/lib/server/db";
import SearchShell from "@/components/admin/SearchShell";
import { MerchOrderCard } from "@/components/admin/ListCards";

export default async function MerchOrderSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await verifyAdminSession();
  const { q = "" } = await searchParams;
  const needle = q.trim().toLowerCase();
  const results = needle
    ? (await listMerchOrders()).filter(
        (o) =>
          o.customerName.toLowerCase().includes(needle) ||
          o.customerPhone.toLowerCase().includes(needle) ||
          o.customerEmail.toLowerCase().includes(needle) ||
          o.orderNumber.toLowerCase().includes(needle) ||
          o.productName.toLowerCase().includes(needle)
      )
    : [];

  return (
    <SearchShell
      placeholder="Customer, phone, order # or product"
      q={q}
      hint="You can search by customer name, phone, email, order number or product name"
      parent="/admin/merch-orders"
      count={results.length}
    >
      <ul className="flex flex-col gap-3">
        {results.map((o) => (
          <MerchOrderCard key={o.id} order={o} />
        ))}
      </ul>
    </SearchShell>
  );
}
