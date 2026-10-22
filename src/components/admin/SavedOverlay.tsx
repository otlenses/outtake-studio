"use client";

import { useCallback, useState } from "react";

/** [saved, flash]: call flash() after a successful save to show the SavedOverlay briefly. */
export function useSavedFlash(): [boolean, () => void] {
  const [saved, setSaved] = useState(false);
  const flash = useCallback(() => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1700);
  }, []);
  return [saved, flash];
}

/** Small centred popup with a self-drawing green tick, shown briefly after a save. */
export default function SavedOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center" role="status" aria-live="polite">
      <div className="saved-pop flex flex-col items-center gap-3 rounded-2xl bg-white px-10 py-8 shadow-xl shadow-ink/15">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline className="saved-check" points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-ink">Saved</span>
      </div>
    </div>
  );
}
