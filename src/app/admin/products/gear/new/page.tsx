import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import { listGearCategories } from "@/lib/server/db";
import GearForm from "../GearForm";

export default async function NewGearProductPage() {
  await verifyAdminSession();
  const categories = await listGearCategories();
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products?type=gear"
        className="hidden md:inline-block mb-6  font-mono text-[11px] tracking-[0.1em] text-ash hover:text-ink"
      >
        ← Back
      </Link>
      <h1 className="mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Add rental product</h1>
      <GearForm categories={categories} />
    </div>
  );
}
