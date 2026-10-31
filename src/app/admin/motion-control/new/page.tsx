import Link from "next/link";
import { verifyAdminSession } from "@/lib/server/dal";
import MotionControlForm from "../MotionControlForm";

export default async function NewMotionControlProductPage() {
  await verifyAdminSession();
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/motion-control"
        className="hidden md:inline-block mb-6  font-mono text-[11px] tracking-[0.1em] text-ash hover:text-ink"
      >
        ← Back
      </Link>
      <h1 className="mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Add motion control product</h1>
      <MotionControlForm />
    </div>
  );
}
