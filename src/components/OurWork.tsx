"use client";

import { useMemo, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import type { WorkItem } from "@/lib/data";
import WorkCard from "./WorkCard";
import ScrollReveal from "./ScrollReveal";
import { tagLabel } from "@/lib/work-tags";

const ALL = "ALL";

// Which stored tags count as each built-in filter (older data used FEATURE / COMMERCIAL).
const FILTER_TAGS: Record<string, string[]> = {
  FEATURE_FILMS: ["FEATURE_FILMS", "FEATURE"],
  TV_COMMERCIAL: ["TV_COMMERCIAL", "COMMERCIAL"],
  MV: ["MV"],
};

// A project can carry several tags, so it shows under every filter it matches.
// It is in Others when none of the filter tags apply.
function matches(item: WorkItem, filter: string, filterKeys: string[]): boolean {
  if (filter === ALL) return true;
  if (filter === "OTHERS") {
    return !filterKeys.some((k) => k !== "OTHERS" && matches(item, k, filterKeys)) || item.tags.includes("OTHERS");
  }
  return item.tags.some((t) => (FILTER_TAGS[filter] ?? [filter]).includes(t));
}

export default function OurWork({ items, customTags }: { items: WorkItem[]; customTags: string[] }) {
  const [active, setActive] = useState<string>(ALL);

  // Built-in filters first, then the tags the client added, Others last.
  const filterKeys = useMemo(
    () => ["FEATURE_FILMS", "TV_COMMERCIAL", "MV", ...customTags, "OTHERS"],
    [customTags]
  );

  const filtered = useMemo(
    () => items.filter((item) => matches(item, active, filterKeys)),
    [active, items, filterKeys]
  );

  return (
    <section className="bg-ink py-20 text-white md:py-28">
      <ScrollReveal className="px-[max(1.5rem,4vw)]">
        <div className="mx-auto mb-10">
          <Breadcrumb dark items={[{ label: "Home", href: "/" }, { label: "Our Work" }]} />
          <h2 className="page-title font-display text-3xl font-black tracking-tight md:text-4xl">
            Our Work
          </h2>

          <div className="mt-8 flex flex-wrap gap-3">
            {[ALL, ...filterKeys].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`rounded-full border px-5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  active === cat
                    ? "border-signal bg-signal text-ink"
                    : "border-white/25 text-white/70 hover:border-white hover:text-white"
                }`}
              >
                {cat === ALL ? "All" : tagLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {filtered.length === 0 ? (
        <p className="py-16 text-center font-mono text-sm text-white/50">
          No projects in this category yet.
        </p>
      ) : (
        <div className="px-[max(1.5rem,4vw)]">
          <div className="mx-auto columns-1 gap-2 sm:columns-2 lg:columns-3">
            {filtered.map((item, i) => (
              <ScrollReveal key={item.id} className="mb-2 break-inside-avoid" delay={(i % 3) * 80}>
                <WorkCard item={item} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
