"use client";

import { useRef, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { getPackageGallery, type PackageItem, formatName } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { CollapsibleSection, ItemList } from "./DetailSections";

function parsePrice(price: string): number {
  const numeric = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export default function PackageDetail({ pkg }: { pkg: PackageItem }) {
  const { addItem } = useCart();
  const gallery = getPackageGallery(pkg);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(99, q + 1));

  const goToImage = (index: number) => {
    const target = (index + gallery.length) % gallery.length;
    setActiveImage(target);
    const el = viewerRef.current;
    if (el) el.scrollTo({ left: el.clientWidth * target, behavior: "smooth" });
  };

  const showPrev = () => goToImage(activeImage - 1);
  const showNext = () => goToImage(activeImage + 1);

  const handleViewerScroll = () => {
    const el = viewerRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveImage((prev) => (prev === index ? prev : index));
  };

  const handleAddToQuote = () => {
    addItem(
      {
        id: pkg.id,
        name: pkg.name,
        category: "Package",
        dailyRate: parsePrice(pkg.price),
        image: pkg.image,
        included: pkg.specSections.find((s) => /includ/i.test(s.title))?.items ?? [],
      },
      quantity
    );
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-[max(1.5rem,4vw)] py-10 md:py-14">
      <Breadcrumb className="mb-8" items={[{ label: "Home", href: "/" }, { label: "Packages", href: "/packages" }, { label: formatName(pkg.name) }]} />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        {/* Gallery */}
        <div>
          <div className="group/viewer relative aspect-square w-full overflow-hidden border border-smoke bg-smoke">
            {pkg.featured && (
              <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-signal px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink">
                Popular
              </span>
            )}

            <div
              ref={viewerRef}
              onScroll={handleViewerScroll}
              className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]"
            >
              {gallery.map((src, i) => (
                <div key={i} className="relative h-full w-full shrink-0 snap-center">
                  <Image
                    src={src}
                    alt={pkg.name}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={showPrev}
                  className="absolute left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity duration-200 group-hover/viewer:opacity-100 hover:bg-white md:flex"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={showNext}
                  className="absolute right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity duration-200 group-hover/viewer:opacity-100 hover:bg-white md:flex"
                >
                  <ChevronIcon direction="right" />
                </button>

                <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5 md:hidden">
                  {gallery.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        activeImage === i ? "w-4 bg-ink" : "w-1.5 bg-ink/30"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`relative aspect-square overflow-hidden border bg-smoke transition-colors ${
                    activeImage === i ? "border-ink" : "border-smoke hover:border-ash/60"
                  }`}
                >
                  <Image src={src} alt={`${pkg.name} thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="page-title font-display text-2xl font-black tracking-tight md:text-3xl">
            {formatName(pkg.name)}
          </h1>
          {pkg.tagline && <p className="mt-1.5 text-sm text-ash">{pkg.tagline}</p>}

          <p className="mt-5 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-black text-ink md:text-4xl">{pkg.price}</span>
            <span className="font-mono text-sm text-ash">{pkg.period}</span>
          </p>

          <div className="mt-5 flex items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
              Quantity
            </span>
            <div className="flex items-center rounded-full border border-ash/40">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={decrement}
                className="flex h-10 w-10 items-center justify-center font-mono text-base text-ink transition-colors hover:text-signal"
              >
                −
              </button>
              <span className="w-10 text-center font-mono text-sm">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={increment}
                className="flex h-10 w-10 items-center justify-center font-mono text-base text-ink transition-colors hover:text-signal"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToQuote}
            className="mt-4 flex items-center justify-center rounded-full bg-signal px-8 py-4 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
          >
            {justAdded ? "Added ✓" : "Add to Quote"}
          </button>

          <p className="mt-2 font-mono text-[10px] tracking-[0.08em] text-ash">
            No payment now — we confirm availability &amp; pricing with you directly.
          </p>

          <CollapsibleSection title="Description" first>
            <p className="whitespace-pre-line text-base leading-relaxed text-ink/50">{pkg.description}</p>
          </CollapsibleSection>

          {pkg.features.length > 0 && (
            <CollapsibleSection title="Highlights">
              <ItemList items={pkg.features} />
            </CollapsibleSection>
          )}

          {pkg.specSections.map((section) => (
            <CollapsibleSection key={section.title} title={section.title}>
              <ItemList items={section.items} />
            </CollapsibleSection>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );
}
