"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SegmentOption = { value: string; label: string; count?: number; dot?: boolean };

/**
 * Category tabs: plain underline tabs (black underline = selected, scrolls sideways) on every screen size.
 */
export default function SegmentedControl({
  options,
  paramName = "status",
}: {
  options: SegmentOption[];
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? "";

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === current)
  );

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep the active tab in view
  useEffect(() => {
    tabRefs.current[activeIndex]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(paramName, value);
    else params.delete(paramName);
    router.push(`${pathname}?${params.toString()}`);
  };

  const label = (opt: SegmentOption) => (
    <span className="relative">
      {opt.label}
      {opt.count !== undefined && <span className="text-ash"> ({opt.count})</span>}
      {opt.dot && <span className="absolute -right-2 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />}
    </span>
  );

  return (
    <>
      <div className="no-scrollbar -mx-6 overflow-x-auto overflow-y-hidden overscroll-x-contain border-b border-ash/20 px-6 md:mx-0 md:px-0">
        <div className="flex min-w-max gap-6">
          {options.map((opt, i) => (
            <button
              key={opt.value || "all"}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`-mb-px whitespace-nowrap border-b-2 px-0.5 pb-2.5 pt-1 text-sm transition-colors ${
                i === activeIndex ? "border-ink font-semibold text-ink" : "border-transparent text-ash"
              }`}
            >
              {label(opt)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
