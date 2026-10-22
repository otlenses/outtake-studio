"use client";

import Link from "next/link";

export const inputClass =
  "w-full rounded-lg border border-ash/30 px-3 py-2.5 text-sm outline-none focus:border-ink";

export function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-[#e8553a]">*</span>}
      </span>
      {children}
      {help && <span className="text-xs text-ash">{help}</span>}
    </label>
  );
}

export function Section({
  title,
  help,
  first,
  children,
}: {
  title: string;
  help?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={first ? "" : "border-t border-ash/15 pt-8"}>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {help && <p className="mt-0.5 text-sm text-ash">{help}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Sticky Cancel / Save bar placed at the end of an admin edit form. */
export function StickyActionBar({
  cancelHref,
  saveLabel,
  isPending,
  onSave,
  canSave = true,
}: {
  cancelHref: string;
  saveLabel: string;
  isPending: boolean;
  /** When false the save button is greyed out (nothing changed yet). */
  canSave?: boolean;
  /** Provide for forms that are not a real <form>; otherwise the button submits the surrounding form. */
  onSave?: () => void;
}) {
  return (
    <>
    {/* keeps the same breathing room under the last field that the in-card bar used to give */}
    <div aria-hidden className="mt-8 h-16" />
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-3 border-t border-ash/15 bg-white px-6 py-3.5 md:left-60">
      <Link
        href={cancelHref}
        className="rounded-full px-5 py-2.5 text-sm font-medium text-ash transition-colors hover:text-ink"
      >
        Cancel
      </Link>
      <button
        type={onSave ? "button" : "submit"}
        onClick={onSave}
        disabled={isPending || !canSave}
        className={`rounded-full px-8 py-2.5 text-sm font-semibold transition-all ${
          canSave ? "bg-signal text-ink hover:scale-[1.02] disabled:opacity-60" : "cursor-not-allowed bg-ash/15 text-ash"
        }`}
      >
        {isPending ? "Saving..." : saveLabel}
      </button>
    </div>
    </>
  );
}

/** Outlined pill with a pencil, used to switch a read-only block into edit mode. */
export function EditDetailsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/25 px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-smoke"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      Edit details
    </button>
  );
}
