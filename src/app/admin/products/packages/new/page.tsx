import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import PackageForm from "../PackageForm";

export default async function NewPackageProductPage() {
  await verifyAdminSession();
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products?type=packages"
        className="hidden md:inline-block mb-6  font-mono text-[11px] tracking-[0.1em] text-ash hover:text-ink"
      >
        ← Back
      </Link>
      <h1 className="mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Add package</h1>
      <PackageForm />
    </div>
  );
}
