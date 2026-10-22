"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MobileNav, type SidebarCounts } from "./Sidebar";
import { logoutAction } from "@/lib/server/actions";
import { timeAgo } from "@/lib/server/activity";
import { BellIcon, ChevronDownIcon, EnquiriesIcon, LogoutIcon, MerchIcon, OrdersIcon } from "./icons";

export type AdminNotification = {
  id: string;
  type: "order" | "enquiry" | "merch";
  title: string;
  subtitle: string;
  submittedAt: string;
  href: string;
};

const NOTIFICATION_META: Record<
  AdminNotification["type"],
  { label: string; icon: React.ReactNode; tint: string }
> = {
  order: { label: "New order request", icon: <OrdersIcon />, tint: "bg-amber-100 text-amber-700" },
  enquiry: { label: "New enquiry", icon: <EnquiriesIcon />, tint: "bg-blue-100 text-blue-600" },
  merch: { label: "New merch order", icon: <MerchIcon />, tint: "bg-purple-100 text-purple-600" },
};

const LIST_ROOTS: Record<string, string> = {
  orders: "/admin/orders",
  "merch-orders": "/admin/merch-orders",
  enquiries: "/admin/enquiries",
  products: "/admin/products",
  merchandise: "/admin/merchandise",
  portfolio: "/admin/portfolio",
};

/** Phone-only: which pages show a big back button instead of the top bar */
function pageKind(pathname: string): { kind: "list" | "detail" | "search"; parent: string } {
  const [, , section, ...rest] = pathname.split("/"); // ["", "admin", section, ...]
  const parent = LIST_ROOTS[section] ?? "/admin";
  if (!LIST_ROOTS[section] || rest.length === 0) return { kind: "list", parent };
  if (rest[0] === "search") return { kind: "search", parent };
  return { kind: "detail", parent };
}

function BackBar({ parent }: { parent: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center border-b border-ash/15 bg-white px-3 py-2 md:hidden">
      <button
        type="button"
        aria-label="Back"
        onClick={() => {
          // go back to where the admin came from; fall back to the list if opened directly
          if (window.history.length > 1) router.back();
          else router.push(parent);
        }}
        className="flex h-12 w-12 items-center justify-center rounded-full text-ink transition-colors hover:bg-smoke"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
}

export default function TopBar({
  email,
  notifications,
  counts,
}: {
  email: string;
  notifications: AdminNotification[];
  counts: SidebarCounts;
}) {
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = email.slice(0, 2).toUpperCase();
  const pathname = usePathname();
  const { kind, parent } = pageKind(pathname);
  const hideOnPhone = kind !== "list";

  return (
    <>
    {kind === "detail" && <BackBar parent={parent} />}
    <header
      className={`items-center justify-between gap-4 border-b border-ash/15 bg-white px-6 py-3.5 ${
        hideOnPhone ? "hidden md:flex" : "flex"
      }`}
    >
      <MobileNav counts={counts} />
      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setBellOpen((v) => !v);
              setMenuOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-smoke"
          >
            <BellIcon />
            {notifications.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 font-mono text-[10px] font-bold text-ink">
                {notifications.length}
              </span>
            )}
          </button>

          {bellOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-white p-3 shadow-lg shadow-ink/10">
                <div className="flex items-center justify-between px-3 pb-2 pt-2">
                  <p className="text-base font-bold text-ink">Notifications</p>
                  <Link
                    href="/admin"
                    onClick={() => setBellOpen(false)}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    View all
                  </Link>
                </div>
                {notifications.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-ash">You&apos;re all caught up.</p>
                ) : (
                  <ul className="flex max-h-96 flex-col overflow-y-auto">
                    {notifications.map((n) => {
                      const meta = NOTIFICATION_META[n.type];
                      return (
                        <li key={n.id}>
                          <Link
                            href={n.href}
                            onClick={() => setBellOpen(false)}
                            className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-smoke"
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.tint}`}
                            >
                              {meta.icon}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[15px] font-semibold text-ink">{meta.label}</span>
                              <span className="block truncate text-sm text-ash">
                                {n.title} · {n.subtitle}
                              </span>
                              <span className="mt-1 block text-xs text-ash/80">{timeAgo(n.submittedAt)}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {/* Admin profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v);
              setBellOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-smoke"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-mono text-[11px] font-semibold text-white">
              {initials}
            </span>
            <ChevronDownIcon />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl bg-white p-2 shadow-lg shadow-ink/10">
                <div className="px-3 py-2">
                  <p className="font-mono text-[10px] tracking-[0.14em] text-ash">Signed in as</p>
                  <p className="truncate text-sm font-medium text-ink">{email}</p>
                </div>
                <div className="my-1 border-t border-ash/15" />
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs tracking-[0.08em] text-ink transition-colors hover:bg-smoke"
                  >
                    <LogoutIcon />
                    Log out
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
