"use client";

import { useMemo, useState } from "react";
import { workItems, type WorkItem } from "@/lib/data";
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

export default function OurWork() {
  const [active, setActive] = useState<Category>("All");

  const filtered = useMemo(
    () => (active === "All" ? workItems : workItems.filter((item) => categorize(item) === active)),
    [active]
  );

  return (
    <section className="bg-ink py-20 text-white md:py-28">
      <ScrollReveal className="px-[max(1.5rem,4vw)]">
        <div className="mx-auto mb-10">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
            Selected Projects
          </p>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
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
