"use client";

import { useMemo, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import type { WorkItem } from "@/lib/data";
import WorkCard from "./WorkCard";
import ScrollReveal from "./ScrollReveal";

const CATEGORIES = ["All", "Feature Films", "TV Commercials", "Music Videos", "Others"] as const;
type Category = (typeof CATEGORIES)[number];

function categorize(item: WorkItem): Category {
  if (item.tags.includes("FEATURE")) return "Feature Films";
  if (item.tags.includes("COMMERCIAL")) return "TV Commercials";
  if (item.tags.includes("MV")) return "Music Videos";
  return "Others";
}

export default function OurWork({ items }: { items: WorkItem[] }) {
  const [active, setActive] = useState<Category>("All");

  const filtered = useMemo(
    () => (active === "All" ? items : items.filter((item) => categorize(item) === active)),
    [active, items]
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
            {CATEGORIES.map((cat) => (
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
                {cat}
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
