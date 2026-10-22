import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { getMerchOrder } from "@/lib/server/db";
import MerchOrderDetailForm from "./MerchOrderDetailForm";

export default async function AdminMerchOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const order = await getMerchOrder(id);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/merch-orders"
        className="hidden md:inline-block mb-6  font-mono text-[11px] tracking-[0.1em] text-ash hover:text-ink"
      >
        ← Back
      </Link>
      <MerchOrderDetailForm order={order} />
    </div>
  );
}
