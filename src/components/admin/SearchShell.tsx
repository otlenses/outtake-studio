"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Full-screen search page shell (phones): back arrow, search field that is focused straight away,
 * a hint before anything is typed, and "Showing results for keyword …" once there is a search.
 */
export default function SearchShell({
  placeholder,
  q,
  hint,
  parent,
  count,
  children,
}: {
  placeholder: string;
  q: string;
  hint: string;
  /** list page to go back to when the page was opened directly */
  parent: string;
  /** number of results (to show the "no results" message) */
  count: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(q);
  const searched = q.trim().length > 0;

  return (
    <div>
      <div className="-mx-6 -mt-8 border-b border-ash/15 bg-white px-2 py-2">
        <form
          action={pathname}
          method="get"
          onSubmit={(e) => {
            e.preventDefault();
            const term = value.trim();
            // replace (not push) so searching again and again never piles up history entries
            router.replace(term ? `${pathname}?q=${encodeURIComponent(term)}` : pathname);
          }}
          className="flex items-center gap-1"
        >
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              // back to the page the admin came from (the list); fall back to the list if opened directly
              if (window.history.length > 1) router.back();
              else router.push(parent);
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-smoke"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash"
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
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              enterKeyHint="search"
              className="h-10 w-full rounded-lg bg-smoke pl-9 pr-10 text-sm text-ink outline-none placeholder:text-ash [&::-webkit-search-cancel-button]:hidden"
            />
            {value && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => {
                  setValue("");
                  router.replace(pathname);
                }}
                className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-ash"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>

      {!searched ? (
        <div className="flex flex-col items-center px-8 pt-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm shadow-ink/5">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-ash" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="mt-5 text-sm text-ash">{hint}</p>
        </div>
      ) : (
        <div className="pt-4">
          <p className="mb-3 text-sm text-ash">Showing results for keyword &ldquo;{q}&rdquo;</p>
          {count === 0 ? (
            <p className="rounded-xl bg-white p-8 text-center text-sm text-ash shadow-sm shadow-ink/5">
              No results found.
            </p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}
