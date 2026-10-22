"use client";

import { useRouter } from "next/navigation";

/** Product dropdown that opens that product's bookings as soon as one is picked. */
export default function ProductPicker({
  options,
  value,
}: {
  options: { id: string; name: string }[];
  value: string;
}) {
  const router = useRouter();
  return (
    <select
      aria-label="Select a product"
      value={value}
      onChange={(e) => router.push(e.target.value ? `/admin/availability?product=${encodeURIComponent(e.target.value)}` : "/admin/availability")}
      className="h-11 w-full rounded-full border border-ash/40 bg-white px-4 text-sm text-ink outline-none focus:border-ink sm:w-72 md:h-auto md:py-2.5 md:font-mono md:text-xs"
    >
      <option value="">Select a product…</option>
      {options.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
