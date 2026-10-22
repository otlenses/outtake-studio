"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BottomSheet from "./BottomSheet";

export type FilterConfig = {
  /** Active / Inactive section — shown only when `counts` is given */
  state?: string;
  counts?: { all: number; active: number; inactive: number };
  /** Rental date range section — shown when given */
  dateRange?: { from: string; to: string; label?: string };
  /** Amount range (RM) section — shown when given */
  amountRange?: { min: string; max: string };
  /** Only for lists that have them (rental gear) */
  categories?: string[];
  category?: string;
  brands?: string[];
  brand?: string;
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition-colors ${
        active ? "bg-signal/70 font-semibold text-ink" : "bg-smoke text-ink/70"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Phone search field (icon inside, Enter to search) with an optional filter button that opens a bottom sheet.
 * Keeps the other URL params (tab, status…) when searching.
 */
export default function MobileSearchBar({
  placeholder,
  q,
  keep = {},
  filter,
  searchHref,
}: {
  placeholder: string;
  q: string;
  /** hidden fields that must survive a search (e.g. {type: "gear", state: "active"}) */
  keep?: Record<string, string>;
  filter?: FilterConfig;
  /** When given, the field is a button that opens this full-screen search page instead of typing here */
  searchHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(filter?.state ?? "all");
  const [from, setFrom] = useState(filter?.dateRange?.from ?? "");
  const [to, setTo] = useState(filter?.dateRange?.to ?? "");
  const toRef = useRef<HTMLInputElement>(null);
  const [min, setMin] = useState(filter?.amountRange?.min ?? "");
  const [max, setMax] = useState(filter?.amountRange?.max ?? "");
  const [category, setCategory] = useState(filter?.category ?? "");
  const [brand, setBrand] = useState(filter?.brand ?? "");

  const filtersActive =
    !!filter &&
    ((!!filter.counts && filter.state !== undefined && filter.state !== "all") ||
      !!filter.category ||
      !!filter.brand ||
      !!filter.dateRange?.from ||
      !!filter.dateRange?.to ||
      !!filter.amountRange?.min ||
      !!filter.amountRange?.max);

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (k: string, v: string, empty: string) => (v && v !== empty ? params.set(k, v) : params.delete(k));
    if (filter?.counts) setOrDelete("state", state, "all");
    if (filter?.categories) setOrDelete("cat", category, "");
    if (filter?.brands) setOrDelete("brand", brand, "");
    if (filter?.dateRange) {
      setOrDelete("from", from, "");
      setOrDelete("to", to, "");
    }
    if (filter?.amountRange) {
      setOrDelete("min", min, "");
      setOrDelete("max", max, "");
    }
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const reset = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["state", "cat", "brand", "from", "to", "min", "max"].forEach((k) => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  return (
    <>
      <form method="get" className="flex items-center gap-2">
        {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
        {searchHref ? (
          <Link
            href={q ? `${searchHref}?q=${encodeURIComponent(q)}` : searchHref}
            className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-ash/40 bg-white px-4 text-sm"
          >
            <svg className="shrink-0 text-ash" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className={`truncate ${q ? "text-ink" : "text-ash"}`}>{q || placeholder}</span>
          </Link>
        ) : (
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={placeholder}
            enterKeyHint="search"
            className="h-11 w-full rounded-full border border-ash/40 bg-white pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ash focus:border-ink"
          />
        </div>
        )}
        {filter && (
          <button
            type="button"
            aria-label="Filter"
            onClick={() => {
              setState(filter.state ?? "all");
              setCategory(filter.category ?? "");
              setBrand(filter.brand ?? "");
              setFrom(filter.dateRange?.from ?? "");
              setTo(filter.dateRange?.to ?? "");
              setMin(filter.amountRange?.min ?? "");
              setMax(filter.amountRange?.max ?? "");
              setOpen(true);
            }}
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white text-ink transition-colors ${
              filtersActive ? "border-signal" : "border-ash/40"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="4" y1="7" x2="20" y2="7" />
              <circle cx="9" cy="7" r="2" fill="white" />
              <line x1="4" y1="17" x2="20" y2="17" />
              <circle cx="15" cy="17" r="2" fill="white" />
            </svg>
            {filtersActive && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-signal" />}
          </button>
        )}
      </form>

      {filter && (
        <BottomSheet open={open} onClose={() => setOpen(false)}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Filter</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-smoke"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {filter.counts && (
            <>
              <p className="mb-2 text-sm font-semibold text-ink">Status</p>
              <div className="mb-5 flex flex-wrap gap-2">
                <Chip active={state === "all"} onClick={() => setState("all")}>All</Chip>
                <Chip active={state === "active"} onClick={() => setState("active")}>Visible</Chip>
                <Chip active={state === "inactive"} onClick={() => setState("inactive")}>Hidden</Chip>
              </div>
            </>
          )}

          {filter.categories && filter.categories.length > 0 && (
            <>
              <p className="mb-2 text-sm font-semibold text-ink">Category</p>
              <div className="mb-5 flex flex-wrap gap-2">
                <Chip active={category === ""} onClick={() => setCategory("")}>All</Chip>
                {filter.categories.map((c) => (
                  <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </Chip>
                ))}
              </div>
            </>
          )}

          {filter.brands && filter.brands.length > 0 && (
            <>
              <p className="mb-2 text-sm font-semibold text-ink">Brand</p>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="mb-6 h-12 w-full rounded-xl border border-ash/40 bg-white px-4 text-sm text-ink outline-none focus:border-ink"
              >
                <option value="">All brands</option>
                {filter.brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </>
          )}

          {filter.dateRange && (
            <>
              <p className="mb-2 text-sm font-semibold text-ink">{filter.dateRange.label ?? "Rental date range"}</p>
              <div className="mb-5 grid grid-cols-2 gap-3">
                <label className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-ash">From</span>
                  <span className="relative block">
                    <input
                      type="date"
                      value={from}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFrom(v);
                        if (v) {
                          // keep the range valid, then jump straight to choosing the end date
                          if (!to || to < v) setTo(v);
                          requestAnimationFrame(() => {
                            try {
                              toRef.current?.showPicker?.();
                            } catch {
                              toRef.current?.focus();
                            }
                          });
                        }
                      }}
                      className={`h-12 w-full min-w-0 appearance-none rounded-xl border border-ash/40 bg-white px-3 text-sm text-ink outline-none focus:border-ink ${
                        from ? "" : "[&::-webkit-datetime-edit]:text-transparent"
                      }`}
                    />
                    {!from && (
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ash">
                        Start date
                      </span>
                    )}
                  </span>
                </label>
                <label className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-ash">To</span>
                  <span className="relative block">
                    <input
                      ref={toRef}
                      type="date"
                      min={from || undefined}
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className={`h-12 w-full min-w-0 appearance-none rounded-xl border border-ash/40 bg-white px-3 text-sm text-ink outline-none focus:border-ink ${
                        to ? "" : "[&::-webkit-datetime-edit]:text-transparent"
                      }`}
                    />
                    {!to && (
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ash">
                        End date
                      </span>
                    )}
                  </span>
                </label>
              </div>
            </>
          )}

          {filter.amountRange && (
            <>
              <p className="mb-2 text-sm font-semibold text-ink">Amount range (RM)</p>
              <div className="mb-6 flex items-center gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Min"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  className="h-12 w-full min-w-0 rounded-xl border border-ash/40 bg-white px-4 text-sm text-ink outline-none focus:border-ink"
                />
                <span className="text-ash">–</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Max"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  className="h-12 w-full min-w-0 rounded-xl border border-ash/40 bg-white px-4 text-sm text-ink outline-none focus:border-ink"
                />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={apply}
            className="w-full rounded-full bg-signal py-3.5 text-sm font-semibold text-ink transition-transform active:scale-[0.99]"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={reset}
            className="mt-2 flex w-full items-center justify-center py-3 text-sm font-medium text-ink underline underline-offset-2"
          >
            Reset
          </button>
        </BottomSheet>
      )}
    </>
  );
}
