"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gearItems } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import ScrollReveal from "./ScrollReveal";
import RentalBanner from "./RentalBanner";

export default function Rental() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
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
    <section className="bg-paper">
      <RentalBanner />

      <div className="px-[max(1.5rem,4vw)] py-16 md:py-24">
        <ScrollReveal className="mx-auto">
          <div className="mb-14 flex flex-col gap-6 border-b border-ash/20 pb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
                  Book by the Day
                </p>
              </div>
              <h2 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
                Rental
              </h2>
              <p className="mt-4 max-w-md text-sm text-ash md:text-base">
                Professionally maintained cinema cameras, glass, and lighting —
                ready when your call sheet is.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/rental"
                className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-ash transition-colors hover:text-ink sm:block"
              >
                View Full Catalogue →
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* Hover-proximity prev/next buttons — only reveal near each edge */}
            {!atStart && (
              <div className="group/prev absolute inset-y-0 left-0 z-20 flex w-20 items-center justify-start pl-2">
                <button
                  type="button"
                  aria-label="Previous items"
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
                  aria-label="Next items"
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
              {gearItems.map((item) => (
                <div
                  key={item.id}
                  data-card
                  className="group w-[65%] shrink-0 snap-start border border-smoke bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5 sm:w-[calc((100%-2.5rem)/3)] md:w-[calc((100%-3.75rem)/4)] lg:w-[calc((100%-6.25rem)/6)]"
                >
                  <Link href={`/rental/${item.id}`} className="relative aspect-square block w-full overflow-hidden bg-smoke">
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
                  </Link>
                  <div className="p-4">
                    <h3 className="font-display text-sm font-bold uppercase tracking-tight">
                      <Link href={`/rental/${item.id}`} className="transition-colors hover:text-signal">
                        {item.name}
                      </Link>
                    </h3>
                    <p className="mt-1.5 flex items-baseline gap-1">
                      <span className="font-display text-2xl font-black text-ink">
                        RM {item.dailyRate.toFixed(2)}
                      </span>
                      <span className="font-mono text-xs text-ash">/ day</span>
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          id: item.id,
                          name: item.name,
                          category: item.category,
                          dailyRate: item.dailyRate,
                          image: item.image,
                        })
                      }
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-signal py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-transform hover:scale-[1.02]"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
