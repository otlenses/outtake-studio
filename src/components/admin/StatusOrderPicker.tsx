"use client";

import { useState } from "react";

/**
 * Status chips. Picking one only *selects* it — nothing is saved until the page's
 * "Save changes" button, which then opens <StatusChangeDialog>.
 */
export default function StatusOrderPicker<T extends string>({
  statuses,
  labels,
  current,
  selected,
  dangerStatus,
  isPending,
  onSelect,
}: {
  statuses: T[];
  labels: Record<T, string>;
  /** The status that is currently saved. */
  current: T;
  /** The status picked in the form (equals `current` when nothing is pending). */
  selected: T;
  dangerStatus?: T;
  isPending?: boolean;
  onSelect: (status: T) => void;
}) {
  const hasPending = selected !== current;
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => {
        const isSaved = s === current;
        const isPicked = s === selected;
        const isDanger = s === dangerStatus;
        let style: string;
        if (isPicked && isSaved) {
          style = isDanger ? "border-red-500 bg-red-500 text-white" : "border-ink bg-ink text-white";
        } else if (isPicked) {
          // picked but not saved yet
          style = isDanger
            ? "border-dashed border-red-500 bg-red-50 text-red-600"
            : "border-dashed border-ink bg-signal/30 text-ink";
        } else if (isSaved && hasPending) {
          style = "border-ink/30 bg-ink/10 text-ink/50";
        } else {
          style = isDanger
            ? "border-red-400 text-red-600 hover:bg-red-50"
            : "border-ash/30 text-ink hover:border-ink";
        }
        return (
          <button
            key={s}
            type="button"
            disabled={isPending}
            onClick={() => onSelect(s)}
            className={`rounded-full border px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.06em] transition-colors max-md:!text-[15px] disabled:opacity-60 ${style}`}
          >
            {labels[s]}
          </button>
        );
      })}
    </div>
  );
}

/** Second confirmation shown by "Save changes" when the status was changed. */
export function StatusChangeDialog({
  from,
  to,
  requiresNote,
  isPending,
  onConfirm,
  onCancel,
}: {
  from: string;
  to: string;
  requiresNote: boolean;
  isPending?: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <h2 className="text-lg font-bold text-ink">Change status?</h2>
        <p className="mt-2 text-sm text-ink/70">
          Are you sure you want to change {from} status to {to}?
        </p>
        <label className="mt-4 flex flex-col gap-1.5 text-left">
          <span className="font-mono text-[11px] tracking-[0.08em] text-ash">
            Note{requiresNote ? <span className="ml-0.5 text-[#e8553a]">*</span> : " (optional)"}
          </span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (noteError) setNoteError(false);
            }}
            placeholder={
              requiresNote ? "Explain why this status is changing…" : "Add a note for the order history (optional)…"
            }
            className={`resize-none rounded border px-3 py-2 text-sm outline-none focus:border-ink ${
              noteError ? "border-red-400" : "border-ash/40"
            }`}
          />
          {noteError && (
            <span className="font-mono text-[11px] text-red-600">
              A note is required when moving this status backward or cancelling.
            </span>
          )}
        </label>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (requiresNote && !note.trim()) {
                setNoteError(true);
                return;
              }
              onConfirm(note.trim());
            }}
            className="flex-1 rounded-full bg-signal py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Yes, change"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="flex-1 rounded-full border border-ash/40 py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-colors hover:border-ink disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
