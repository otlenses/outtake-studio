import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { getMotionControlProduct } from "@/lib/server/db";
import MotionControlForm from "../../MotionControlForm";

export default async function EditMotionControlProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const product = await getMotionControlProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/motion-control"
        className="hidden md:inline-block mb-6  font-mono text-[11px] tracking-[0.1em] text-ash hover:text-ink"
      >
        ← Back
      </Link>
      <h1 className="mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Edit motion control product</h1>
      <MotionControlForm initial={product} />
    </div>
  );
}
