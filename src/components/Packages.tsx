"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { packages as allPackages } from "@/lib/data";

const packages = allPackages.filter((pkg) => pkg.featuredOnHome);
import PackageCard from "./PackageCard";
import ScrollReveal from "./ScrollReveal";

export default function Packages() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]") as HTMLElement | null;
    const step = card ? card.offsetWidth + 20 : 300;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="bg-paper px-[max(1.5rem,4vw)] py-20 md:py-28">
      <ScrollReveal className="mx-auto">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
              Bundled Rates
            </p>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
              Equipment Packages
            </h2>
          </div>
          <Link
            href="/packages"
            className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-ash transition-colors hover:text-ink sm:block"
          >
            Explore All Packages →
          </Link>
        </div>

        <div className="relative">
          {/* Hover-proximity prev/next buttons — only reveal near each edge */}
          {!atStart && (
            <div className="group/prev absolute inset-y-0 left-0 z-20 flex w-20 items-center justify-start pl-2">
              <button
                type="button"
                aria-label="Previous packages"
                onClick={() => scroll(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg shadow-ink/10 transition-all duration-300 group-hover/prev:opacity-100 hover:!bg-signal"
              >
                ←
              </button>
            </div>
          )}
          {!atEnd && (
            <div className="group/next absolute inset-y-0 right-0 z-20 flex w-20 items-center justify-end pr-2">
              <button
                type="button"
                aria-label="Next packages"
                onClick={() => scroll(1)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg shadow-ink/10 transition-all duration-300 group-hover/next:opacity-100 hover:!bg-signal"
              >
                →
              </button>
            </div>
          )}

          <div
            ref={scrollerRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
          >
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
              >
                <PackageCard pkg={pkg} />
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
