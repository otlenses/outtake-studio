"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import BottomSheet from "./BottomSheet";
import ConfirmDialog from "./ConfirmDialog";
import ToggleSwitch from "./ToggleSwitch";
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from "./icons";

/**
 * Compact phone card for admin lists (products, packages, merchandise, portfolio):
 * photo + details on top, ⋮ menu (edit / delete), Active label and switch underneath.
 */
export default function MobileProductCard({
  id,
  name,
  image,
  editHref,
  subtitle,
  price,
  priceSuffix,
  tags,
  badge,
  enabled,
  toggleAction,
  deleteAction,
  noun,
  move,
  onLabel = "Visible on website",
  offLabel = "Hidden",
}: {
  id: string;
  name: string;
  image: string;
  editHref: string;
  subtitle?: string;
  /** e.g. "RM 60.00" with suffix "/day" */
  price?: string;
  priceSuffix?: string;
  /** muted extra line (portfolio tags) */
  tags?: string;
  badge?: string;
  enabled: boolean;
  toggleAction: (id: string, enabled: boolean) => Promise<unknown>;
  deleteAction: (id: string) => Promise<void>;
  /** "product" | "package" | "project" — used in the menu labels */
  noun: string;
  /** Wording next to the switch */
  onLabel?: string;
  offLabel?: string;
  /** Reorder arrows (portfolio) */
  move?: { action: (id: string, dir: "up" | "down") => Promise<void>; canUp: boolean; canDown: boolean };
}) {
  const [on, setOn] = useState(enabled);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <li data-off={!on} className="group/card rounded-xl bg-white shadow-sm shadow-ink/5">
      <div className="flex items-start gap-2 px-3 pb-2 pt-2.5">
        <Link
          href={editHref}
          className="flex min-w-0 flex-1 items-center gap-3 transition-opacity group-data-[off=true]/card:opacity-60"
        >
          <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-lg bg-smoke">
            <Image src={image} alt={name} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="flex items-start gap-2 text-[15px] font-medium leading-snug text-ink">
              <span className="line-clamp-2">{name}</span>
              {badge && (
                <span className="shrink-0 rounded-full bg-signal/25 px-2 py-0.5 text-[10px] font-semibold">{badge}</span>
              )}
            </p>
            {subtitle && <p className="mt-1 truncate text-xs font-normal text-ash">{subtitle}</p>}
            {price && (
              <p className="mt-1 text-sm font-semibold text-ink">
                {price}
                {priceSuffix && <span className="text-xs font-normal text-ash max-md:!text-[12px]"> {priceSuffix}</span>}
              </p>
            )}
            {tags && <p className="mt-1 truncate text-xs text-ash">{tags}</p>}
          </div>
        </Link>
        <button
          type="button"
          aria-label="More actions"
          onClick={() => setMenuOpen(true)}
          className="-mr-1 -mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-smoke"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ash/15 px-3 py-1.5">
        <span className="flex items-center gap-2 text-xs font-medium text-ink">
          <span className={`h-2 w-2 rounded-full ${on ? "bg-emerald-500" : "bg-ash/50"}`} />
          {on ? onLabel : offLabel}
        </span>
        <div className="flex items-center gap-3">
          {move && (
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Move up"
                disabled={!move.canUp}
                onClick={() => startTransition(() => move.action(id, "up"))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-smoke disabled:opacity-30"
              >
                <ArrowUpIcon />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={!move.canDown}
                onClick={() => startTransition(() => move.action(id, "down"))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-smoke disabled:opacity-30"
              >
                <ArrowDownIcon />
              </button>
            </div>
          )}
          <ToggleSwitch id={id} initialEnabled={enabled} action={toggleAction} onChange={setOn} />
        </div>
      </div>

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Link
          href={editHref}
          className="flex items-center gap-4 py-4 text-[15px] font-medium text-ink"
          onClick={() => setMenuOpen(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Edit {noun}
        </Link>
        <div className="border-t border-ash/15" />
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            setConfirming(true);
          }}
          className="flex w-full items-center gap-4 py-4 text-[15px] font-medium text-red-600"
        >
          <span className="[&_svg]:h-5 [&_svg]:w-5">
            <TrashIcon />
          </span>
          Delete {noun}
        </button>
      </BottomSheet>

      {confirming && (
        <ConfirmDialog
          title="Delete this?"
          message={`Delete "${name}"? This can't be undone.`}
          confirmLabel="Yes, delete"
          onConfirm={() => {
            setConfirming(false);
            startTransition(() => deleteAction(id));
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </li>
  );
}
