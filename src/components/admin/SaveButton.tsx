"use client";

/** Plain save button for inline (non-sticky) forms; submits the surrounding form. */
export default function SaveButton({
  isPending,
  label = "Save changes",
  canSave = true,
}: {
  isPending: boolean;
  label?: string;
  /** When false the button is greyed out (nothing changed yet). */
  canSave?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={isPending || !canSave}
      className={`rounded-full px-8 py-3 text-sm font-semibold transition-all ${
        canSave ? "bg-signal text-ink hover:scale-[1.02] disabled:opacity-60" : "cursor-not-allowed bg-ash/15 text-ash"
      }`}
    >
      {isPending ? "Saving..." : label}
    </button>
  );
}
