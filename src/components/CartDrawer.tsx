"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const money = (n: number) => n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearItems } = useCart();

  const total = items.reduce((sum, i) => sum + i.dailyRate * i.quantity, 0);

  const handleNext = () => {
    closeCart();
    router.push("/quotation");
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col bg-white text-ink transition-transform duration-300 ${
          isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-start justify-between px-6 pb-4 pt-6">
          <div>
            <h2 className="font-display text-[26px] font-black tracking-tight">Your Quote</h2>
            {items.length > 0 && (
              <p className="mt-1 text-sm text-ash">
                {items.length} {items.length === 1 ? "item" : "items"} in your quote list
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close quote"
            onClick={closeCart}
            className="-mr-2 -mt-1 flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-signal"
          >
            <RemoveIcon />
          </button>
        </div>

        <div className="mx-6 border-t border-ash/20" />

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ash">
              Your quote is empty. Add gear or packages to build a quotation request.
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-ash/20 py-5">
                  <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden bg-smoke">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-2 font-display text-base font-bold leading-snug tracking-tight">
                      {item.name}
                    </span>
                    <p className="mt-1 flex items-baseline gap-1">
                      <span className="font-display text-base font-extrabold">RM {money(item.dailyRate)}</span>
                      <span className="text-xs text-ash">/ day</span>
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-ash/40">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center text-base text-ink transition-colors hover:text-signal"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center text-base text-ink transition-colors hover:text-signal"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="flex h-9 w-9 items-center justify-center text-ink/70 transition-colors hover:text-ink"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 pb-6 pt-4">
            <div className="rounded-2xl bg-[#f7f7f6] px-5 py-4">
              <p className="text-sm text-ink/70">Estimated Rental Total</p>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-tight">RM {money(total)}</p>
              <p className="mt-2 text-xs leading-relaxed text-ash">
                Based on listed daily rental rates. Final pricing and availability will be confirmed with you.
              </p>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-signal py-3.5 text-sm font-bold uppercase tracking-[0.04em] text-ink transition-transform hover:scale-[1.02]"
            >
              Continue to Enquiry <span aria-hidden>→</span>
            </button>
            <button
              type="button"
              onClick={clearItems}
              className="mx-auto mt-3 block text-sm text-ink underline underline-offset-2 transition-colors hover:text-ash"
            >
              Clear quote list
            </button>
            <p className="mt-4 flex items-start justify-center gap-2 text-xs leading-relaxed text-ash">
              <ShieldIcon />
              <span>No payment required — we will confirm availability &amp; pricing with you directly.</span>
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 7h16" />
      <path d="M9 7V4.5h6V7" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </svg>
  );
}

export function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.83 14.16c-.25.7-1.24 1.28-2.02 1.44-.54.11-1.24.2-3.62-.78-3.04-1.26-5-4.35-5.15-4.55-.15-.2-1.23-1.64-1.23-3.13s.77-2.22 1.05-2.52c.27-.3.6-.37.8-.37.2 0 .4.002.57.01.18.008.43-.07.67.51.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.77 1.27 1.66 2.06 1.14 1.02 2.1 1.34 2.4 1.49.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.75.82 2.05.97.3.15.5.22.57.35.08.13.08.72-.17 1.42Z" />
    </svg>
  );
}
