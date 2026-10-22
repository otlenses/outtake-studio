"use client";

import { useEffect, useRef, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

export default function ConfirmSaveButton({
  onSave,
  isPending,
  label = "Save changes",
  confirmTitle = "Save these changes?",
  confirmMessage = "Please confirm you want to save these changes.",
}: {
  onSave: () => void;
  isPending: boolean;
  label?: string;
  confirmTitle?: string;
  confirmMessage?: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending) {
      setJustSaved(true);
      const timer = setTimeout(() => setJustSaved(false), 3000);
      wasPending.current = isPending;
      return () => clearTimeout(timer);
    }
    wasPending.current = isPending;
  }, [isPending]);

  const handleConfirm = () => {
    setShowConfirm(false);
    onSave();
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="rounded-full bg-signal px-8 py-3 font-mono text-xs font-semibold tracking-[0.06em] text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {isPending ? "Saving..." : label}
        </button>
        {justSaved && !isPending && (
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-700">
            <CheckIcon />
            Saved
          </span>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title={confirmTitle}
          message={confirmMessage}
          confirmLabel="Yes, save"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
