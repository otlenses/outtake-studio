"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gearItems, type GearItem } from "@/lib/data";
import { useCart } from "@/lib/cart-context";

const CATEGORY_LABELS: Record<GearItem["category"], string> = {
  CAMERA: "Cameras",
  LENS: "Lenses",
  LIGHT: "Lighting",
  GRIP: "Grip & Support",
};

const PAGE_SIZE = 24;

type SortKey = "recommended" | "price-asc" | "price-desc";

function useFacetCounts<T extends string>(items: GearItem[], key: "brand" | "category") {
  return useMemo(() => {
    const counts = new Map<T, number>();
    for (const item of items) {
      const value = item[key] as T;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return counts;
  }, [items, key]);
}

export default function RentalCatalogue() {
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [newOnly, setNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("recommended");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const brandCounts = useFacetCounts<string>(gearItems, "brand");
  const categoryCounts = useFacetCounts<GearItem["category"]>(gearItems, "category");
  const newCount = useMemo(() => gearItems.filter((i) => i.isNew).length, []);

  const brands = useMemo(
    () => [...brandCounts.keys()].sort((a, b) => a.localeCompare(b)),
    [brandCounts]
  );
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 5);

  const categories = useMemo(
    () => (["CAMERA", "LENS", "LIGHT", "GRIP"] as const).filter((c) => categoryCounts.get(c)),
    [categoryCounts]
  );

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = gearItems.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query) && !item.brand.toLowerCase().includes(query))
        return false;
      if (selectedBrands.size > 0 && !selectedBrands.has(item.brand)) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(item.category)) return false;
      if (newOnly && !item.isNew) return false;
      return true;
    });

    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.dailyRate - b.dailyRate);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.dailyRate - a.dailyRate);

    return result;
  }, [searchQuery, selectedBrands, selectedCategories, newOnly, sortBy]);

  // Reset pagination whenever the result set changes shape
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedBrands, selectedCategories, newOnly, sortBy]);

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const hasFilters =
    searchQuery.trim().length > 0 || selectedBrands.size > 0 || selectedCategories.size > 0 || newOnly;

  const eraseAll = () => {
    setSearchQuery("");
    setSelectedBrands(new Set());
    setSelectedCategories(new Set());
    setNewOnly(false);
  };

  return (
    <div className="mx-auto w-full px-[max(1.5rem,4vw)] py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
            Full Catalogue
          </p>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            Rental
          </h1>
        </div>

        <label className="relative w-full md:w-72">
          <span className="sr-only">Search gear</span>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search camera, lens, brand…"
            className="w-full rounded-full border border-ash/40 bg-white py-2.5 pl-10 pr-9 font-mono text-xs text-ink outline-none transition-colors placeholder:text-ash focus:border-ink"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ash transition-colors hover:text-ink"
            >
              ✕
            </button>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-12">
        {/* Sidebar */}
        <aside className="shrink-0 md:sticky md:top-20 md:w-56">
          <FilterGroup title="Brand">
            <div className="flex flex-col gap-2.5">
              {visibleBrands.map((brand) => (
                <Checkbox
                  key={brand}
                  label={brand}
                  count={brandCounts.get(brand) ?? 0}
                  checked={selectedBrands.has(brand)}
                  onChange={() => toggle(selectedBrands, setSelectedBrands, brand)}
                />
              ))}
            </div>
            {brands.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllBrands((v) => !v)}
                className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink underline decoration-ash/50 underline-offset-2 transition-colors hover:text-signal"
              >
                {showAllBrands ? "Show less" : "Show more"}
              </button>
            )}
          </FilterGroup>

          <FilterGroup title="Category">
            <div className="flex flex-col gap-2.5">
              {categories.map((cat) => (
                <Checkbox
                  key={cat}
                  label={CATEGORY_LABELS[cat]}
                  count={categoryCounts.get(cat) ?? 0}
                  checked={selectedCategories.has(cat)}
                  onChange={() => toggle(selectedCategories, setSelectedCategories, cat)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Status">
            <Checkbox
              label="New Arrival"
              count={newCount}
              checked={newOnly}
              onChange={() => setNewOnly((v) => !v)}
            />
          </FilterGroup>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {hasFilters && (
            <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-ash/20 pb-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                Selected:
              </span>
              {searchQuery.trim() && (
                <Chip label={`"${searchQuery.trim()}"`} onRemove={() => setSearchQuery("")} />
              )}
              {[...selectedBrands].map((b) => (
                <Chip key={`b-${b}`} label={b} onRemove={() => toggle(selectedBrands, setSelectedBrands, b)} />
              ))}
              {[...selectedCategories].map((c) => (
                <Chip
                  key={`c-${c}`}
                  label={CATEGORY_LABELS[c as GearItem["category"]]}
                  onRemove={() => toggle(selectedCategories, setSelectedCategories, c)}
                />
              ))}
              {newOnly && <Chip label="New Arrival" onRemove={() => setNewOnly(false)} />}
              <button
                type="button"
                onClick={eraseAll}
                className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ash underline underline-offset-2 transition-colors hover:text-ink"
              >
                Erase all filters
              </button>
            </div>
          )}

          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="font-mono text-xs text-ash">{filtered.length} items</p>
            <label className="flex items-center gap-2">
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ash sm:inline">
                Sort by
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="cursor-pointer rounded-full border border-ash/40 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink outline-none transition-colors hover:border-ink"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center font-mono text-sm text-ash">
              No gear matches {searchQuery.trim() ? `"${searchQuery.trim()}"` : "these filters"}. Try
              clearing a few.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {visibleItems.map((item) => (
                  <div key={item.id} className="group flex flex-col">
                    <Link
                      href={`/rental/${item.id}`}
                      className="relative aspect-square w-full overflow-hidden border border-smoke bg-smoke transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-ink/10"
                    >
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white">
                        {item.category}
                      </span>
                      <button
                        type="button"
                        aria-label={wishlist.has(item.id) ? "Remove from wishlist" : "Add to wishlist"}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(item.id);
                        }}
                        className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] transition-colors hover:text-signal"
                      >
                        <HeartIcon filled={wishlist.has(item.id)} />
                      </button>
                      <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-sm font-bold uppercase tracking-tight">
                          <Link href={`/rental/${item.id}`} className="transition-colors group-hover:text-signal">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="mt-1 flex items-baseline gap-1">
                          <span className="font-display text-lg font-black text-ink">
                            RM {item.dailyRate.toFixed(2)}
                          </span>
                          <span className="font-mono text-[11px] text-ash">/ day</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Add ${item.name} to cart`}
                        onClick={() =>
                          addItem({
                            id: item.id,
                            name: item.name,
                            category: item.category,
                            dailyRate: item.dailyRate,
                            image: item.image,
                          })
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal text-ink transition-transform hover:scale-110"
                      >
                        <CartIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-14 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                    className="rounded-full border border-ink px-8 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-white"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-8 border-b border-ash/20 pb-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-4 flex w-full items-center justify-between font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink"
      >
        {title}
        <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open && children}
    </div>
  );
}

function Checkbox({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      onClick={onChange}
      className="group/row flex cursor-pointer items-center gap-2.5 text-sm text-ink"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
          checked ? "border-ink bg-ink text-white" : "border-ash/50 bg-white group-hover/row:border-ink"
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span
        className={`select-none transition-colors group-hover/row:text-signal ${
          checked ? "font-bold" : "font-normal"
        }`}
      >
        {label}
      </span>
      <span className="font-mono text-xs text-ash">({count})</span>
    </label>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-smoke px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`} className="text-ash hover:text-ink">
        ✕
      </button>
    </span>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className={filled ? "text-signal" : ""}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
