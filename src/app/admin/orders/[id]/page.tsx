import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { getOrder } from "@/lib/server/db";
import OrderDetailForm from "./OrderDetailForm";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="hidden md:inline-block mb-6  font-mono text-[11px] tracking-[0.1em] text-ash hover:text-ink"
      >
        ← Back
      </Link>
      <OrderDetailForm order={order} />
    </div>
  );
}
