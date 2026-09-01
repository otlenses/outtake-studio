"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCart();

  const total = items.reduce((sum, i) => sum + i.dailyRate * i.quantity, 0);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col bg-paper text-ink shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-smoke px-6 py-5">
          <h2 className="font-display text-lg font-black uppercase tracking-tight">
            Rental Request
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center text-ash transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center font-mono text-xs uppercase tracking-[0.14em] text-ash">
              Your cart is empty. Add gear from the Rental section to build a quote request.
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-smoke">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-display text-sm font-bold uppercase tracking-tight">
                      {item.name}
                    </span>
                    <span className="font-mono text-xs text-ash">
                      RM {item.dailyRate.toFixed(2)} / day
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-ash/40 font-mono text-xs"
                      >
                        −
                      </button>
                      <span className="w-4 text-center font-mono text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-ash/40 font-mono text-xs"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-ash transition-colors hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-smoke px-6 py-5">
            <div className="mb-4 flex items-center justify-between font-mono text-sm">
              <span className="text-ash">Est. total / day</span>
              <span className="font-semibold">RM {total.toFixed(2)}</span>
            </div>
            <Link
              href="/rental?checkout=1"
              onClick={closeCart}
              className="flex w-full items-center justify-center rounded-full bg-signal py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-transform hover:scale-[1.02]"
            >
              Submit Rental Request
            </Link>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.08em] text-ash">
              No payment now — we confirm availability &amp; pricing with you directly.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
