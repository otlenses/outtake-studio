"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toTitleCase, type GearItem, formatName } from "@/lib/data";
import type { BannerContent } from "@/lib/server/db";
import ScrollReveal from "./ScrollReveal";
import SiteBanner from "./SiteBanner";

function formatRate(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString("en-MY") : n.toFixed(2);
}

export default function Rental({ items, banner }: { items: GearItem[]; banner: BannerContent }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState("ALL");

  // Only categories that actually have items on the home rail
  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);
  const visibleItems = category === "ALL" ? items : items.filter((i) => i.category === category);

  const pickCategory = (c: string) => {
    setCategory(c);
    scrollerRef.current?.scrollTo({ left: 0 });
  };

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (dir === 1 && el.scrollLeft >= maxScroll - 4) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (dir === -1 && el.scrollLeft <= 4) {
      el.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }
    const card = el.querySelector("[data-card]") as HTMLElement | null;
    const step = card ? card.offsetWidth + 20 : 300;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="bg-paper">
      <SiteBanner content={banner} showButton />

      <div className="px-[max(1.5rem,4vw)] pb-16 pt-16 md:pb-24 md:pt-24">
        <ScrollReveal className="mx-auto">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 hidden items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
                  Rental
                </p>
              </div>
              <h2 className="page-title font-display text-3xl font-black leading-[1.05] tracking-tight md:text-4xl">
                Professional Camera Gear
              </h2>
            </div>
            <a
              href="/Gear-List.pdf"
              download
              className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-sm text-blue-600 transition-colors hover:text-blue-800"
            >
              <span className="underline underline-offset-2">Full gear list &gt;</span>
            </a>
          </div>

          {categories.length > 1 && (
            <div className="no-scrollbar -mx-1 mb-8 flex gap-1 overflow-x-auto border-b border-ash/20 px-1">
              {["ALL", ...categories].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => pickCategory(c)}
                  aria-pressed={category === c}
                  className={`-mb-px shrink-0 border-b-2 px-3 py-3 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
                    category === c ? "border-signal text-ink" : "border-transparent text-ash hover:text-ink"
                  }`}
                >
                  {c === "ALL" ? "All" : toTitleCase(c)}
                </button>
              ))}
            </div>
          )}

          <div className="group/rail relative">
            {/* Desktop-only hover prev/next buttons — never intercept touch swipes */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-20 items-center justify-start pl-2 md:flex">
              <button
                type="button"
                aria-label="Previous items"
                onClick={() => scroll(-1)}
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg shadow-ink/10 transition-all duration-300 group-hover/rail:opacity-100 hover:!bg-signal"
              >
                ←
              </button>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-20 items-center justify-end pr-2 md:flex">
              <button
                type="button"
                aria-label="Next items"
                onClick={() => scroll(1)}
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg shadow-ink/10 transition-all duration-300 group-hover/rail:opacity-100 hover:!bg-signal"
              >
                →
              </button>
            </div>

            <div
              ref={scrollerRef}
              className="no-scrollbar flex snap-x snap-proximity gap-5 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch]"
            >
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  data-card
                  className="group relative flex w-[65%] shrink-0 flex-col snap-start border border-smoke bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5 sm:w-[calc((100%-2.5rem)/3)] md:w-[calc((100%-3.75rem)/4)] lg:w-[calc((100%-6.25rem)/6)]"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <span className="absolute left-2 top-2 z-10 rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white">
                      {item.category}
                    </span>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 65vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 font-display text-lg font-black leading-tight tracking-tight transition-colors group-hover:text-signal">
                      {formatName(item.name)}
                    </h3>
                    <p className="mt-auto flex items-baseline gap-1.5 pt-2">
                      <span className="font-display text-2xl font-black tracking-tight text-ink">RM {formatRate(item.dailyRate)}</span>
                      <span className="text-xs text-ash">/ day</span>
                    </p>
                  </div>
                  <Link
                    href={`/rental/${item.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={item.name}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/rental"
              className="rounded-full bg-signal px-10 py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
            >
              View All
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
