"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  DashboardIcon,
  EnquiriesIcon,
  MerchIcon,
  OrdersIcon,
  PortfolioIcon,
  MotionControlIcon,
  ProductsIcon,
  SettingsIcon,
} from "./icons";

export type SidebarCounts = {
  orders: number;
  merchOrders: number;
  enquiries: number;
};

function navGroups(counts: SidebarCounts) {
  return [
    {
      label: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true, badge: 0 }],
    },
    {
      label: "Operations",
      items: [
        { href: "/admin/orders", label: "Order requests", icon: OrdersIcon, exact: false, badge: counts.orders },
        {
          href: "/admin/merch-orders",
          label: "Merch orders",
          icon: MerchIcon,
          exact: false,
          badge: counts.merchOrders,
        },
        {
          href: "/admin/enquiries",
          label: "Enquiries",
          icon: EnquiriesIcon,
          exact: false,
          badge: counts.enquiries,
        },
        { href: "/admin/availability", label: "Availability", icon: CalendarIcon, exact: false, badge: 0 },
      ],
    },
    {
      label: "Catalog",
      items: [
        { href: "/admin/products", label: "Products & packages", icon: ProductsIcon, exact: false, badge: 0 },
        { href: "/admin/merchandise", label: "Merchandise", icon: MerchIcon, exact: false, badge: 0 },
        { href: "/admin/portfolio", label: "Portfolio", icon: PortfolioIcon, exact: false, badge: 0 },
        { href: "/admin/motion-control", label: "Motion control", icon: MotionControlIcon, exact: false, badge: 0 },
      ],
    },
    {
      label: "System",
      items: [
        { href: "/admin/settings", label: "Settings", icon: SettingsIcon, exact: false, badge: 0 },
      ],
    },
  ];
}

function NavList({ counts, onNavigate }: { counts: SidebarCounts; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = navGroups(counts);

  return (
    <nav>
      {groups.map((group, gi) => (
        <div key={group.label || "root"} className={`px-3 py-3 ${gi > 0 ? "border-t border-ash/15" : ""}`}>
          {group.label && <p className="px-3 pb-2 text-xs text-ash">{group.label}</p>}
          {group.items.map(({ href, label, icon: Icon, exact, badge }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors [&_svg]:h-[18px] [&_svg]:w-[18px] ${
                  isActive ? "bg-signal font-medium text-ink" : "text-ink/50 hover:bg-smoke hover:text-ink"
                }`}
              >
                <Icon />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** Phone drawer list: plain text, light group labels, thin dividers between groups, yellow active row. */
function DrawerNav({ counts, onNavigate }: { counts: SidebarCounts; onNavigate: () => void }) {
  const pathname = usePathname();
  const groups = navGroups(counts);

  return (
    <nav>
      {groups.map((group, gi) => (
        <div key={group.label || "root"} className={`px-3 py-3.5 ${gi > 0 ? "border-t border-ash/15" : ""}`}>
          {group.label && <p className="px-3 pb-2 text-sm text-ash max-md:!text-[14px]">{group.label}</p>}
          {group.items.map(({ href, label, icon: Icon, exact, badge }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-3.5 text-base max-md:!text-[16px] transition-colors [&_svg]:h-5 [&_svg]:w-5 ${
                  isActive ? "bg-signal font-medium text-ink" : "text-ink/50 hover:bg-smoke hover:text-ink"
                }`}
              >
                <Icon />
                <span className="flex-1">{label}</span>
                {badge > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-sm font-semibold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar({ counts }: { counts: SidebarCounts }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-ash/15 bg-white md:flex md:flex-col">
      <div className="px-6 py-6">
        <span className="font-display text-xl font-semibold tracking-tight text-ink">Out Take Admin</span>
      </div>
      <NavList counts={counts} />
    </aside>
  );
}

/** Phone-only: menu button + slide-in drawer with the same links as the sidebar. */
export function MobileNav({ counts }: { counts: SidebarCounts }) {
  const [open, setOpen] = useState(false);
  const total = counts.orders + counts.merchOrders + counts.enquiries;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-smoke"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        {total > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
      </button>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[76%] max-w-[300px] flex-col overflow-y-auto bg-white pb-6 shadow-xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="font-display text-xl font-semibold tracking-tight text-ink">Out Take Admin</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-smoke"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <DrawerNav counts={counts} onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </div>
  );
}
