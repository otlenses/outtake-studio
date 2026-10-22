"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PackageItem } from "@/lib/data";
import PackageCard from "./PackageCard";
import ScrollReveal from "./ScrollReveal";

type SortKey = "recommended" | "price-asc" | "price-desc";

export default function PackagesGrid({ packages }: { packages: PackageItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("recommended");
  const [popularOnly, setPopularOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSort, setDraftSort] = useState<SortKey>("recommended");
  const [draftPopular, setDraftPopular] = useState(false);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = query
      ? packages.filter(
          (pkg) => pkg.name.toLowerCase().includes(query) || pkg.tagline.toLowerCase().includes(query)
        )
      : packages;
    if (popularOnly) list = list.filter((pkg) => pkg.featured);
    if (sortBy !== "recommended") {
      const amount = (pkg: PackageItem) => parseFloat(pkg.price.replace(/[^0-9.]/g, "")) || 0;
      list = [...list].sort((a, b) => (sortBy === "price-asc" ? amount(a) - amount(b) : amount(b) - amount(a)));
    }
    return list;
  }, [packages, searchQuery, sortBy, popularOnly]);

  const activeFilterCount = (popularOnly ? 1 : 0) + (sortBy !== "recommended" ? 1 : 0);
  const openFilterSheet = () => {
    setDraftSort(sortBy);
    setDraftPopular(popularOnly);
    setFilterOpen(true);
  };
  const applyFilters = () => {
    setSortBy(draftSort);
    setPopularOnly(draftPopular);
    setFilterOpen(false);
  };

  return (
    <section className="bg-paper px-[max(1.5rem,4vw)] py-14 md:py-20">
      <ScrollReveal className="mx-auto">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <nav className="mb-4 text-sm text-[#959595]">
            <Link href="/">Home</Link> &gt; <span>Equipment Packages</span>
          </nav>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash hidden">
              Bundled Rates
            </p>
            <h1 className="page-title font-display text-[32px] font-black tracking-tight md:text-4xl">
              Equipment Packages
            </h1>
            <p className="mt-4 max-w-xl text-sm text-[#959595] md:text-base">
              Pre-built kits covering everything from one-day shoots to
              multi-day broadcast productions. Compare rates below or contact
              us for a custom build.
            </p>
          </div>

          <label className="relative hidden w-full md:block md:w-80">
            <span className="sr-only">Search packages</span>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search packages…"
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

        <div className="-mt-4 mb-6 flex items-center gap-2 md:hidden">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search packages</span>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search packages…"
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="17" x2="20" y2="17" />
              <circle cx="9" cy="7" r="2.2" fill="white" />
              <circle cx="15" cy="17" r="2.2" fill="white" />
            </svg>
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 font-mono text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center font-mono text-sm text-ash">
            No packages match{searchQuery.trim() ? <> &quot;{searchQuery.trim()}&quot;</> : " these filters"}. Try a different search.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-4 md:hidden">
              {filtered.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} variant="row" />
              ))}
            </div>
            <div className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-4">
              {filtered.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </>
        )}
      </ScrollReveal>

      {/* Phone filter sheet */}
      <div
        className={`fixed inset-0 z-[80] bg-black/50 transition-opacity duration-300 md:hidden ${
          filterOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setFilterOpen(false)}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-[90] flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          filterOpen ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!filterOpen}
      >
        <div className="flex items-center justify-between border-b border-smoke px-5 py-4">
          <h2 className="font-display text-base font-black tracking-tight">Filters</h2>
          <button type="button" aria-label="Close filters" onClick={() => setFilterOpen(false)} className="flex h-8 w-8 items-center justify-center text-ash">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">Sort by</p>
          <div className="flex flex-col gap-3">
            {(
              [
                ["recommended", "Recommended"],
                ["price-asc", "Price: Low to High"],
                ["price-desc", "Price: High to Low"],
              ] as [SortKey, string][]
            ).map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-3 text-[15px] text-ink">
                <input
                  type="radio"
                  name="package-sort"
                  checked={draftSort === value}
                  onChange={() => setDraftSort(value)}
                  className="h-4 w-4 accent-[#0b0b0c]"
                />
                {label}
              </label>
            ))}
          </div>
          <label className="mt-8 flex cursor-pointer items-center justify-between border-t border-ash/20 pt-6">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">Popular only</span>
            <input
              type="checkbox"
              checked={draftPopular}
              onChange={(e) => setDraftPopular(e.target.checked)}
              className="h-5 w-5 accent-[#0b0b0c]"
            />
          </label>
        </div>
        <div className="flex items-center gap-3 border-t border-smoke px-5 py-4">
          <button
            type="button"
            onClick={() => {
              setDraftSort("recommended");
              setDraftPopular(false);
            }}
            className="flex-1 rounded-full border border-ash/40 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink"
          >
            Reset
          </button>
          <button type="button" onClick={applyFilters} className="flex-1 rounded-full bg-signal py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink">
            Apply
          </button>
        </div>
      </div>
    </section>
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
