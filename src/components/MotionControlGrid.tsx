"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MotionControlProduct } from "@/lib/motion-control";
import ScrollReveal from "./ScrollReveal";

export default function MotionControlGrid({ products }: { products: MotionControlProduct[] }) {
  const [active, setActive] = useState<MotionControlProduct | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  return (
    <section className="bg-paper px-[max(1.5rem,4vw)] py-14 md:py-20">
      <ScrollReveal className="mx-auto">
        <div className="mb-10">
          <nav className="mb-4 text-sm text-ash">
            <Link href="/">Home</Link> &gt; <span>Motion Control</span>
          </nav>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash hidden">Robotic Camera Movement</p>
          <h1 className="page-title font-display text-[32px] font-black tracking-tight md:text-4xl">Motion Control</h1>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p)}
              className="group flex flex-col text-left"
            >
              <div className="relative aspect-square w-full overflow-hidden border border-smoke bg-smoke transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-ink/10">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-3 flex flex-1 flex-col">
                <span className="line-clamp-2 font-display text-base font-extrabold leading-tight tracking-tight md:text-lg">{p.name}</span>
                <span className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ash transition-colors group-hover:text-ink">
                  Rate card →
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollReveal>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${active.name} rate card`}
        >
          <div
            className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-ash/20 px-5 py-3">
              <h2 className="font-display text-base font-bold">{active.name} — Rate card</h2>
              <div className="flex items-center gap-4">
                <a
                  href={active.rateCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink underline underline-offset-2 hover:text-signal"
                >
                  Open in new tab
                </a>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-ash hover:bg-smoke hover:text-ink"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe src={active.rateCardUrl} title={`${active.name} rate card`} className="h-full w-full flex-1" />
          </div>
        </div>
      )}
    </section>
  );
}
