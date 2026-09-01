"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getGearGallery, getGearOverview, getGearSpecs, type GearItem } from "@/lib/data";
import { useCart } from "@/lib/cart-context";

const CATEGORY_LABELS: Record<GearItem["category"], string> = {
  CAMERA: "Cameras",
  LENS: "Lenses",
  LIGHT: "Lighting",
  GRIP: "Grip & Support",
};

export default function ProductDetail({ item }: { item: GearItem }) {
  const { addItem } = useCart();
  const gallery = getGearGallery(item);
  const overview = getGearOverview(item);
  const specs = getGearSpecs(item);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(99, q + 1));

  const showPrev = () => setActiveImage((i) => (i - 1 + gallery.length) % gallery.length);
  const showNext = () => setActiveImage((i) => (i + 1) % gallery.length);

  const scrollThumbs = (direction: "left" | "right") => {
    const el = thumbsRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const active = gallery[activeImage];
  const hasManyThumbs = gallery.length > 4;

  const handleAddToCart = () => {
    addItem(
      {
        id: item.id,
        name: item.name,
        category: item.category,
        dailyRate: item.dailyRate,
        image: item.image,
      },
      quantity
    );
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-[max(1.5rem,4vw)] py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
        <Link href="/rental" className="transition-colors hover:text-ink">
          Rental
        </Link>
        <span>/</span>
        <span className="text-ink">{CATEGORY_LABELS[item.category]}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        {/* Gallery */}
        <div>
          <div className="group/viewer relative aspect-square w-full overflow-hidden border border-smoke bg-smoke">
            <span className="absolute left-3 top-3 z-10 rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-white">
              {item.category}
            </span>
            {item.isNew && (
              <span className="absolute right-3 top-3 z-10 rounded-full bg-signal px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink">
                New
              </span>
            )}

            {active.type === "video" ? (
              <video
                key={active.src}
                src={active.src}
                poster={active.poster}
                controls
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={active.src}
                alt={item.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            )}

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous media"
                  onClick={showPrev}
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity duration-200 group-hover/viewer:opacity-100 hover:bg-white"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Next media"
                  onClick={showNext}
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity duration-200 group-hover/viewer:opacity-100 hover:bg-white"
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="group/thumbs relative mt-4">
              <div
                ref={thumbsRef}
                className="flex gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {gallery.map((media, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={media.type === "video" ? "View video" : `View image ${i + 1}`}
                    className={`relative aspect-square w-[calc((100%-2.25rem)/4)] shrink-0 overflow-hidden border bg-smoke transition-colors sm:w-[calc((100%-3.75rem)/6)] md:w-[calc((100%-2.25rem)/4)] ${
                      activeImage === i ? "border-ink" : "border-smoke hover:border-ash/60"
                    }`}
                  >
                    <Image
                      src={media.type === "video" ? media.poster : media.src}
                      alt={media.type === "video" ? `${item.name} video` : `${item.name} thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    {media.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink/30">
                        <PlayIcon />
                      </span>
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
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash">{item.brand}</p>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight md:text-3xl">
            {item.name}
          </h1>

          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-black text-ink">
              RM {item.dailyRate.toFixed(2)}
            </span>
            <span className="font-mono text-sm text-ash">/ day</span>
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

          <div className="mt-6 flex items-stretch gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-signal px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-transform hover:scale-[1.02]"
            >
              {justAdded ? "Added ✓" : "Add to Cart"}
            </button>
            <button
              type="button"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => setWishlisted((v) => !v)}
              className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                wishlisted ? "border-ink text-signal" : "border-ash/40 text-ink hover:border-ink"
              }`}
            >
              <HeartIcon filled={wishlisted} />
            </button>
          </div>

          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-ash">
            No payment now — we confirm availability &amp; pricing with you directly.
          </p>

          {/* Overview */}
          <div className="mt-10 border-t border-ash/20 pt-8">
            <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              Overview
            </h2>
            <p className="text-sm leading-relaxed text-ash">{overview}</p>
          </div>

          {/* Specifications */}
          <div className="mt-8 border-t border-ash/20 pt-8">
            <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              Specifications
            </h2>
            <dl className="divide-y divide-ash/15 border-t border-b border-ash/15">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-6 py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ash">{key}</dt>
                  <dd className="text-right text-sm font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
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

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
