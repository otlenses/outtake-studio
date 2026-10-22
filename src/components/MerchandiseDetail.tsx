"use client";

import { useRef, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CollapsibleSection } from "./DetailSections";
import { getMerchGallery, MERCH_SIZES, type MerchItem, formatName } from "@/lib/data";

export default function MerchandiseDetail({ item }: { item: MerchItem }) {
  const router = useRouter();
  const gallery = getMerchGallery(item);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<(typeof MERCH_SIZES)[number]>("M");
  const [quantity, setQuantity] = useState(1);
  const thumbsRef = useRef<HTMLDivElement>(null);
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

  const scrollThumbs = (direction: "left" | "right") => {
    const el = thumbsRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const hasManyThumbs = gallery.length > 4;

  const handleBuyNow = () => {
    const params = new URLSearchParams({ id: item.id, size, qty: String(quantity) });
    router.push(`/merchandise/checkout?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-[max(1.5rem,4vw)] py-10 md:py-14">
      <Breadcrumb className="mb-8" items={[{ label: "Home", href: "/" }, { label: "Merchandise", href: "/merchandise" }, { label: formatName(item.name) }]} />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        {/* Gallery */}
        <div>
          <div className="group/viewer relative aspect-square w-full overflow-hidden border border-smoke bg-smoke">
            {item.image ? (
              <div
                ref={viewerRef}
                onScroll={handleViewerScroll}
                className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]"
              >
                {gallery.map((src, i) => (
                  <div key={i} className="relative h-full w-full shrink-0 snap-center">
                    <Image
                      src={src}
                      alt={item.name}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ash">
                <TagIcon size={48} />
              </div>
            )}

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
            <div className="group/thumbs relative mt-4">
              <div
                ref={thumbsRef}
                className="flex gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative aspect-square w-[calc((100%-2.25rem)/4)] shrink-0 overflow-hidden border bg-smoke transition-colors sm:w-[calc((100%-3.75rem)/6)] md:w-[calc((100%-2.25rem)/4)] ${
                      activeImage === i ? "border-ink" : "border-smoke hover:border-ash/60"
                    }`}
                  >
                    {src ? (
                      <Image src={src} alt={`${item.name} thumbnail ${i + 1}`} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ash">
                        <TagIcon size={18} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {hasManyThumbs && (
                <>
                  <button
                    type="button"
                    aria-label="Scroll thumbnails left"
                    onClick={() => scrollThumbs("left")}
                    className="absolute -left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity duration-200 group-hover/thumbs:opacity-100 hover:bg-white"
                  >
                    <ChevronIcon direction="left" />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll thumbnails right"
                    onClick={() => scrollThumbs("right")}
                    className="absolute -right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity duration-200 group-hover/thumbs:opacity-100 hover:bg-white"
                  >
                    <ChevronIcon direction="right" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="page-title font-display text-2xl font-black tracking-tight md:text-3xl">
            {formatName(item.name)}
          </h1>

          <p className="mt-5 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-black text-ink md:text-4xl">
              RM {item.price.toFixed(2)}
            </span>
          </p>

          {/* Size */}
          <div className="mt-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
              Size
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {MERCH_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`flex h-10 w-12 items-center justify-center rounded-full border font-mono text-xs uppercase transition-colors ${
                    size === s
                      ? "border-ink bg-ink text-white"
                      : "border-ash/40 text-ink hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
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

          <div className="mt-4 flex items-stretch gap-3">
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-signal px-8 py-4 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
            >
              Buy Now
            </button>
          </div>

          <CollapsibleSection title="Description" first>
            <p className="whitespace-pre-line text-base leading-relaxed text-ink/50">{item.description}</p>
          </CollapsibleSection>

          <CollapsibleSection title="Shipping, Returns & Exchanges">
            <p className="whitespace-pre-line text-base leading-relaxed text-ink/50">{item.shippingInfo}</p>
          </CollapsibleSection>
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

function TagIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.82Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
