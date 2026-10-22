"use client";

import { useState } from "react";

/** Bold heading with a show/hide arrow; expanded by default. Shared by all public detail pages. */
export function CollapsibleSection({
  title,
  first,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`border-t border-ash/20 pt-6 ${first ? "mt-10" : "mt-6"}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 text-left font-display text-lg font-bold text-ink"
      >
        {title}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        >
          <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={`${i}-${item}`} className="text-[15px] leading-snug text-ink/50">
          {item}
        </li>
      ))}
    </ul>
  );
}
