"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/our-work" },
  { label: "Rental", href: "/rental" },
  { label: "Packages", href: "/packages" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-ink">
      <div className="mx-auto flex items-center justify-between px-[max(1.5rem,4vw)] py-4">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/logo/OT_Logo_White.png"
            alt="Out Take Studio"
            width={160}
            height={46}
            className="h-11 w-auto"
            priority
          />
        </Link>

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

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center">
            <div
              className={`flex items-center overflow-hidden rounded-full border border-white/25 transition-all duration-300 ${
                searchOpen ? "w-44 px-3" : "w-9 px-0 justify-center"
              }`}
            >
              <button
                type="button"
                aria-label="Toggle search"
                onClick={() => setSearchOpen((v) => !v)}
                className="flex h-9 w-9 shrink-0 items-center justify-center text-white"
              >
                <SearchIcon />
              </button>
              <input
                type="text"
                placeholder="Search gear…"
                aria-hidden={!searchOpen}
                tabIndex={searchOpen ? 0 : -1}
                className={`h-9 w-full bg-transparent font-mono text-xs text-white placeholder:text-white/40 outline-none transition-opacity duration-200 ${
                  searchOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />
            </div>
          </div>

          <button
            type="button"
            aria-label="Open cart"
            onClick={openCart}
            className="relative flex h-9 w-9 items-center justify-center text-white"
          >
            <CartIcon />
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

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-out lg:hidden ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 border-t border-white/10 px-[max(1.5rem,4vw)] py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 font-mono text-sm uppercase tracking-[0.14em] text-white/85 transition-colors hover:text-signal"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
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

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
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
