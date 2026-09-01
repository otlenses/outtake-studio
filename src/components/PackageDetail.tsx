"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPackageGallery, type PackageItem } from "@/lib/data";

export default function PackageDetail({ pkg }: { pkg: PackageItem }) {
  const gallery = getPackageGallery(pkg);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(99, q + 1));

  const showPrev = () => setActiveImage((i) => (i - 1 + gallery.length) % gallery.length);
  const showNext = () => setActiveImage((i) => (i + 1) % gallery.length);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-[max(1.5rem,4vw)] py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
        <Link href="/packages" className="transition-colors hover:text-ink">
          Packages
        </Link>
        <span>/</span>
        <span className="text-ink">{pkg.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        {/* Gallery */}
        <div>
          <div className="group/viewer relative aspect-square w-full overflow-hidden border border-smoke bg-smoke">
            {pkg.featured && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-signal px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink">
                Popular
              </span>
            )}

            <Image
              src={gallery[activeImage]}
              alt={pkg.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={showPrev}
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity duration-200 group-hover/viewer:opacity-100 hover:bg-white"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={showNext}
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity duration-200 group-hover/viewer:opacity-100 hover:bg-white"
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
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
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
            {pkg.tagline}
          </p>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
            {pkg.name}
          </h1>

          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-black text-ink">{pkg.price}</span>
            <span className="font-mono text-sm text-ash">{pkg.period}</span>
          </p>

          <div className="mt-8 flex items-center gap-4">
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

          <Link
            href="/contact"
            className="mt-6 flex items-center justify-center rounded-full bg-signal px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-transform hover:scale-[1.02]"
          >
            Contact Us for Availability
          </Link>

          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-ash">
            No payment now — we confirm availability &amp; pricing with you directly.
          </p>

          {/* Description */}
          <div className="mt-10 border-t border-ash/20 pt-8">
            <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              Description
            </h2>
            <p className="text-sm leading-relaxed text-ash">{pkg.description}</p>
          </div>

          {/* What's Included */}
          <SpecSection title="What's Included" items={pkg.included} />

          {/* Battery */}
          <SpecSection title="Battery" items={pkg.battery} />

          {/* Lens Control */}
          <SpecSection title="Lens Control" items={pkg.lensControl} />
        </div>
      </div>
    </div>
  );
}

function SpecSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-8 border-t border-ash/20 pt-8">
      <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">
        {title}
      </h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-ash">
            <span className="mt-0.5 text-ink">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
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
