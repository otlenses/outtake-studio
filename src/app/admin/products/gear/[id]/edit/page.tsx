import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { getGearProduct, listGearCategories } from "@/lib/server/db";
import GearForm from "../../GearForm";

export default async function EditGearProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdminSession();
  const { id } = await params;
  const [product, categories] = await Promise.all([getGearProduct(id), listGearCategories()]);
  if (!product) notFound();

  const allCategories = categories.includes(product.category)
    ? categories
    : [...categories, product.category];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products?type=gear"
        className="hidden md:inline-block mb-6  font-mono text-[11px] tracking-[0.1em] text-ash hover:text-ink"
      >
        ← Back
      </Link>
      <h1 className="mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Edit rental product</h1>
      <GearForm initial={product} categories={allCategories} />
    </div>
  );
}
