"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { searchCatalogAction } from "@/lib/server/actions";
import type { CatalogSearchResult } from "@/lib/server/db";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/our-work" },
  { label: "Rental", href: "/rental" },
  { label: "Packages", href: "/packages" },
  { label: "Motion Control", href: "/motion-control" },
  { label: "Merchandise", href: "/merchandise" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { itemCount, openCart } = useCart();
  const pathname = usePathname();
  const transparentTop = pathname === "/" && atTop && !menuOpen;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const found = await searchCatalogAction(query);
        setResults(found);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const closeSearch = () => {
    setSearchOpen(false);
    setPhoneSearch(false);
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    if (menuOpen || phoneSearch) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, phoneSearch]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 24);
      const scrolledDown = y > lastY;
      const pastThreshold = y > 96;

      if (menuOpen) {
        setHidden(false);
      } else {
        setHidden(scrolledDown && pastThreshold);
      }
      lastY = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        transparentTop ? "bg-transparent" : "bg-ink"
      } ${hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}
    >
      {/* Home page: fade the bar out over the banner until the page is scrolled */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-transparent transition-opacity duration-300 ${
          transparentTop ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative mx-auto flex items-center justify-between px-[max(1.5rem,4vw)] py-4">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/logo/OTLenses_Logo_White.png"
            alt="Out Take Studio"
            width={1147}
            height={231}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-mono text-xs uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-signal"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="relative hidden sm:flex items-center">
            <div
              className={`flex items-center overflow-hidden rounded-full border border-white/25 transition-all duration-300 ${
                searchOpen ? "w-56 px-3" : "w-9 px-0 justify-center"
              }`}
            >
              <button
                type="button"
                aria-label="Toggle search"
                onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                className="flex h-9 w-9 shrink-0 items-center justify-center text-white"
              >
                <SearchIcon />
              </button>
              <input
                type="text"
                placeholder="Search gear or merch…"
                aria-hidden={!searchOpen}
                tabIndex={searchOpen ? 0 : -1}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`h-9 w-full bg-transparent font-mono text-xs text-white placeholder:text-white/40 outline-none transition-opacity duration-200 ${
                  searchOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />
            </div>

            {searchOpen && query.trim() && (
              <>
                <div className="fixed inset-0 z-40" onClick={closeSearch} />
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl bg-white p-2 shadow-xl shadow-ink/20">
                  {searching ? (
                    <p className="px-3 py-4 text-center font-mono text-xs text-ash">Searching…</p>
                  ) : results.length === 0 ? (
                    <p className="px-3 py-4 text-center font-mono text-xs text-ash">
                      No matches for &ldquo;{query}&rdquo;.
                    </p>
                  ) : (
                    <ul className="flex max-h-96 flex-col gap-0.5 overflow-y-auto">
                      {results.map((r) => (
                        <li key={`${r.type}-${r.id}`}>
                          <Link
                            href={r.href}
                            onClick={closeSearch}
                            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-smoke"
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-smoke">
                              <Image src={r.image} alt={r.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-ink">{r.name}</p>
                              <p className="font-mono text-[11px] text-ash">
                                {r.type === "gear" ? "Rental" : "Merchandise"} · {r.priceLabel}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Search"
            onClick={() => setPhoneSearch(true)}
            className="flex h-9 w-9 items-center justify-center text-white sm:hidden"
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            aria-label="Open quote"
            onClick={openCart}
            className="relative flex h-9 w-9 items-center justify-center text-white"
          >
            <QuoteIcon />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 font-mono text-[10px] font-semibold text-ink">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-white lg:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

    </header>

    {/* Phone: full-screen search */}
    <div
      className={`fixed inset-0 z-[70] flex flex-col bg-white text-ink transition-opacity duration-200 sm:hidden ${
        phoneSearch ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!phoneSearch}
    >
      <div className="flex items-center gap-3 border-b border-smoke px-[max(1.5rem,4vw)] py-3">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search gear or merch</span>
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={(el) => {
              if (el && phoneSearch) el.focus();
            }}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gear or merch…"
            tabIndex={phoneSearch ? 0 : -1}
            className="h-11 w-full rounded-full border border-ash/40 bg-white pl-11 pr-4 text-[15px] text-ink outline-none placeholder:text-ash focus:border-ink"
          />
        </label>
        <button type="button" onClick={closeSearch} tabIndex={phoneSearch ? 0 : -1} className="shrink-0 text-[15px] text-ink">
          Cancel
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-[max(1.5rem,4vw)] py-4">
        {!query.trim() ? (
          <p className="py-10 text-center text-sm text-ash">Search rental gear and merchandise.</p>
        ) : searching ? (
          <p className="py-10 text-center text-sm text-ash">Searching…</p>
        ) : results.length === 0 ? (
          <p className="py-10 text-center text-sm text-ash">No matches for &ldquo;{query}&rdquo;.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {results.map((r) => (
              <li key={`${r.type}-${r.id}`}>
                <Link href={r.href} onClick={closeSearch} className="flex items-center gap-3 rounded-lg py-2 active:bg-smoke">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-smoke">
                    <Image src={r.image} alt={r.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-ink">{r.name}</p>
                    <p className="text-xs text-ash">
                      {r.type === "gear" ? "Rental" : "Merchandise"} · {r.priceLabel}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {/* Phone / tablet: full-screen menu */}
    <div
      className={`fixed inset-0 z-[60] flex flex-col bg-ink transition-opacity duration-300 lg:hidden ${
        menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!menuOpen}
    >
      <div className="flex items-center justify-between px-[max(1.5rem,4vw)] py-4">
        <Link href="/" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1} className="flex items-center">
          <Image
            src="/logo/OTLenses_Logo_White.png"
            alt="Out Take Studio"
            width={1147}
            height={231}
            className="h-9 w-auto"
          />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          className="flex h-10 w-10 items-center justify-center text-white"
        >
          <CloseIcon />
        </button>
      </div>

      <nav className="flex flex-1 flex-col items-center justify-center gap-0.5 overflow-y-auto px-6 py-4">
        {NAV_LINKS.map((link, i) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.label}
              href={link.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: menuOpen ? `${80 + i * 35}ms` : "0ms" }}
              className={`px-4 py-2.5 text-center font-body text-[26px] leading-tight tracking-tight transition-all duration-500 hover:text-signal ${
                active ? "text-signal" : "text-white/90"
              } ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-3 px-6 pb-8">
        <a
          href="https://instagram.com/outtakestudio"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Out Take Studio on Instagram"
          tabIndex={menuOpen ? 0 : -1}
          className="flex h-10 w-10 items-center justify-center text-white/80 transition-colors hover:text-signal"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <p className="font-mono text-[11px] text-white/40">
          © {new Date().getFullYear()} Out Take Studio. All Rights Reserved.
        </p>
      </div>
    </div>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
