"use client";

import { useRef } from "react";
import Link from "next/link";
import type { PackageItem } from "@/lib/data";
import PackageCard from "./PackageCard";
import ScrollReveal from "./ScrollReveal";

export default function Packages({ packages }: { packages: PackageItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

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
    <section className="bg-[#f7f7f6] px-[max(1.5rem,4vw)] pb-20 pt-16 md:pb-28 md:pt-24">
      <ScrollReveal className="mx-auto">
        <div className="mb-12">
          <div className="mb-3 hidden items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
              Equipment Packages
            </p>
          </div>
          <h2 className="page-title font-display text-3xl font-black leading-[1.05] tracking-tight md:text-4xl">
            Complete Production Setups
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-ash md:text-base">
            Pre-built kits covering everything from one-day shoots to multi-day broadcast productions. Compare rates
            below or contact us for a custom build.
          </p>
        </div>

        <div className="group/rail relative">
          {/* Desktop-only hover prev/next buttons — never intercept touch swipes */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-20 items-center justify-start pl-2 md:flex">
            <button
              type="button"
              aria-label="Previous packages"
              onClick={() => scroll(-1)}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg shadow-ink/10 transition-all duration-300 group-hover/rail:opacity-100 hover:!bg-signal"
            >
              ←
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-20 items-center justify-end pr-2 md:flex">
            <button
              type="button"
              aria-label="Next packages"
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
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-5rem)/4.5)]"
              >
                <PackageCard pkg={pkg} variant="home" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/packages"
            className="rounded-full bg-signal px-10 py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
          >
            Explore All
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
