import Link from "next/link";

/** Phone quick filter: All / Active / Inactive as links that keep the other URL params. */
export default function StatusChips({
  items,
}: {
  items: { label: string; count: number; href: string; active: boolean }[];
}) {
  return (
    <div className="no-scrollbar -mx-6 flex gap-1.5 overflow-x-auto overflow-y-hidden overscroll-x-contain px-6">
      {items.map((it) => (
        <Link
          key={it.label}
          href={it.href}
          className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
            it.active
              ? "bg-signal/45 font-medium text-ink"
              : "border border-ash/20 bg-white/70 text-ink/60"
          }`}
        >
          {it.label} ({it.count})
        </Link>
      ))}
    </div>
  );
}
