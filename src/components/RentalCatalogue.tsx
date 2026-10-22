"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toTitleCase, type GearItem, formatName } from "@/lib/data";

const CATEGORY_LABELS: Record<string, string> = {
  CAMERA: "Cameras",
  LENS: "Lenses",
  LIGHT: "Lighting",
  GRIP: "Grip & Support",
};

// Well-known brands get their own filter checkbox; anything an admin adds
// outside this list is grouped under a catch-all "Others" filter instead of
// cluttering the sidebar with one-off brand names.
const KNOWN_BRANDS = new Set([
  "Aputure",
  "ARRI",
  "Canon",
  "DJI",
  "Freefly",
  "Laowa",
  "Litepanels",
  "RED",
  "Sachtler",
  "Sony",
  "Zeiss",
]);
const OTHERS_BRAND = "Others";

function brandLabel(brand: string): string {
  return KNOWN_BRANDS.has(brand) ? brand : OTHERS_BRAND;
}

function matchesBrandFilter(item: GearItem, selected: Set<string>): boolean {
  return selected.size === 0 || selected.has(brandLabel(item.brand));
}

const PAGE_SIZE = 24;

type SortKey = "recommended" | "price-asc" | "price-desc";

function useFacetCounts<T extends string>(items: GearItem[], key: "brand" | "category") {
  return useMemo(() => {
    const counts = new Map<T, number>();
    for (const item of items) {
      const value = (key === "brand" ? brandLabel(item.brand) : item[key]) as T;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return counts;
  }, [items, key]);
}

export default function RentalCatalogue({ items }: { items: GearItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [newOnly, setNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("recommended");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Mobile filter sheet — draft state so edits only take effect on "Apply"
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftBrands, setDraftBrands] = useState<Set<string>>(new Set());
  const [draftCategories, setDraftCategories] = useState<Set<string>>(new Set());
  const [draftNewOnly, setDraftNewOnly] = useState(false);

  useEffect(() => {
    if (filterOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterOpen]);

  const brandCounts = useFacetCounts<string>(items, "brand");
  const categoryCounts = useFacetCounts<string>(items, "category");
  const newCount = useMemo(() => items.filter((i) => i.isNew).length, []);

  const brands = useMemo(
    () =>
      [...brandCounts.keys()].sort((a, b) => {
        if (a === OTHERS_BRAND) return 1;
        if (b === OTHERS_BRAND) return -1;
        return a.localeCompare(b);
      }),
    [brandCounts]
  );
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 5);

  const categories = useMemo(
    () => [...categoryCounts.keys()].sort((a, b) => a.localeCompare(b)),
    [categoryCounts]
  );

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = items.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query) && !item.brand.toLowerCase().includes(query))
        return false;
      if (!matchesBrandFilter(item, selectedBrands)) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(item.category)) return false;
      if (newOnly && !item.isNew) return false;
      return true;
    });

    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.dailyRate - b.dailyRate);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.dailyRate - a.dailyRate);

    return result;
  }, [searchQuery, selectedBrands, selectedCategories, newOnly, sortBy]);

  // Live preview count for the mobile sheet's "Apply" button, based on draft selections
  const draftFilteredCount = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (query && !item.name.toLowerCase().includes(query) && !item.brand.toLowerCase().includes(query))
        return false;
      if (!matchesBrandFilter(item, draftBrands)) return false;
      if (draftCategories.size > 0 && !draftCategories.has(item.category)) return false;
      if (draftNewOnly && !item.isNew) return false;
      return true;
    }).length;
  }, [searchQuery, draftBrands, draftCategories, draftNewOnly]);

  // Reset pagination whenever the result set changes shape
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedBrands, selectedCategories, newOnly, sortBy]);

  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const hasFilters =
    searchQuery.trim().length > 0 || selectedBrands.size > 0 || selectedCategories.size > 0 || newOnly;

  const activeFilterCount = selectedBrands.size + selectedCategories.size + (newOnly ? 1 : 0);

  const eraseAll = () => {
    setSearchQuery("");
    setSelectedBrands(new Set());
    setSelectedCategories(new Set());
    setNewOnly(false);
  };

  const openFilterSheet = () => {
    setDraftBrands(new Set(selectedBrands));
    setDraftCategories(new Set(selectedCategories));
    setDraftNewOnly(newOnly);
    setFilterOpen(true);
  };

  const closeFilterSheet = () => setFilterOpen(false);

  const resetDraft = () => {
    setDraftBrands(new Set());
    setDraftCategories(new Set());
    setDraftNewOnly(false);
  };

  const applyFilters = () => {
    setSelectedBrands(draftBrands);
    setSelectedCategories(draftCategories);
    setNewOnly(draftNewOnly);
    setFilterOpen(false);
  };

  return (
    <div className="mx-auto w-full px-[max(1.5rem,4vw)] py-12 md:py-16">
      <div className="mb-6 hidden md:flex md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="mb-4 text-sm text-ash">
            <Link href="/">Home</Link> &gt; <span>Rental</span>
          </nav>
          <h1 className="page-title font-display text-4xl font-black tracking-tight">Rental</h1>
          <p className="mt-4 text-base text-ash">Cameras, lenses and production equipment for your next shoot.</p>
        </div>

        <label className="relative w-full md:w-80">
          <span className="sr-only">Search gear</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search camera, lens, brand…"
            className="h-11 w-full rounded-full border border-ash/40 bg-white pl-11 pr-10 text-[15px] text-ink outline-none transition-colors placeholder:text-ash focus:border-ink"
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

      {/* Phone header: breadcrumb, title, description, search + filter */}
      <div className="md:hidden">
        <nav className="mb-4 text-sm text-ash">
          <Link href="/">Home</Link> &gt; <span>Rental</span>
        </nav>
        <h1 className="page-title font-display text-[32px] font-black tracking-tight">Rental</h1>
        <p className="mt-4 text-sm text-ash">Cameras, lenses and production equipment for your next shoot.</p>
        <div className="mt-6 flex items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search gear</span>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search camera, lens, brand…"
              className="h-11 w-full rounded-full border border-ash/40 bg-white pl-11 pr-10 text-[15px] text-ink outline-none transition-colors placeholder:text-ash focus:border-ink"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ash"
              >
                ✕
              </button>
            )}
          </label>
          <button
            type="button"
            aria-label="Filter and sort"
            onClick={openFilterSheet}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ash/40 bg-white text-ink transition-colors hover:border-ink"
          >
            <FilterIcon />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 font-mono text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <p className="mb-6 mt-5 text-xs text-ash">{filtered.length} items</p>
      </div>

      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-12">
        {/* Sidebar — desktop only; mobile uses the Filter sheet instead */}
        <aside className="hidden shrink-0 md:sticky md:top-20 md:block md:w-56">
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
                  label={CATEGORY_LABELS[cat] ?? toTitleCase(cat)}
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
                  label={CATEGORY_LABELS[c] ?? toTitleCase(c)}
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

          {/* Desktop-only: item count + sort dropdown */}
          <div className="mb-6 hidden items-center justify-between gap-4 md:flex">
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                {visibleItems.map((item) => (
                  <div key={item.id} className="group flex flex-col">
                    <Link
                      href={`/rental/${item.id}`}
                      className="relative aspect-square w-full overflow-hidden border border-smoke bg-smoke transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-ink/10"
                    >
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white">
                        {item.category}
                      </span>
                      <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    <div className="mt-3 flex flex-1 flex-col">
                      <h3 className="line-clamp-2 font-display text-base font-extrabold md:text-lg leading-tight tracking-tight">
                        <Link href={`/rental/${item.id}`} className="transition-colors group-hover:text-signal">
                          {formatName(item.name)}
                        </Link>
                      </h3>
                      <p className="mt-auto flex items-baseline gap-1.5 pt-1.5">
                        <span className="font-display text-xl font-black md:text-2xl tracking-tight text-ink">
                          RM {Number.isInteger(item.dailyRate) ? item.dailyRate.toLocaleString("en-MY") : item.dailyRate.toFixed(2)}
                        </span>
                        <span className="text-xs text-ash">/ day</span>
                      </p>
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

      {/* Mobile filter sheet */}
      <div
        className={`fixed inset-0 z-[80] bg-black/50 transition-opacity duration-300 md:hidden ${
          filterOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeFilterSheet}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-[90] flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          filterOpen ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!filterOpen}
      >
        <div className="flex items-center justify-between border-b border-smoke px-5 py-4">
          <h2 className="font-display text-base font-black tracking-tight">Filters</h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={closeFilterSheet}
            className="flex h-8 w-8 items-center justify-center text-ash transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          <FilterGroup title="Brand">
            <div className="flex flex-col gap-2.5">
              {visibleBrands.map((brand) => (
                <Checkbox
                  key={brand}
                  label={brand}
                  count={brandCounts.get(brand) ?? 0}
                  checked={draftBrands.has(brand)}
                  onChange={() => toggle(draftBrands, setDraftBrands, brand)}
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
                  label={CATEGORY_LABELS[cat] ?? toTitleCase(cat)}
                  count={categoryCounts.get(cat) ?? 0}
                  checked={draftCategories.has(cat)}
                  onChange={() => toggle(draftCategories, setDraftCategories, cat)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Sort by">
            <div className="flex flex-col gap-2.5">
              {(
                [
                  ["recommended", "Recommended"],
                  ["price-asc", "Price: Low to High"],
                  ["price-desc", "Price: High to Low"],
                ] as [SortKey, string][]
              ).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === value}
                    onChange={() => setSortBy(value)}
                    className="h-4 w-4 accent-[#0b0b0c]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </FilterGroup>

          <div className="flex items-center justify-between py-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">
              New Arrival
            </span>
            <ToggleSwitch checked={draftNewOnly} onChange={() => setDraftNewOnly((v) => !v)} />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-smoke px-5 py-4">
          <button
            type="button"
            onClick={resetDraft}
            className="flex-1 rounded-full border border-ash/40 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="flex-1 rounded-full bg-signal py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
          >
            Apply ({draftFilteredCount})
          </button>
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

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-ink" : "bg-ash/30"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
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

function FilterIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}
