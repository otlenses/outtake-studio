"use client";

import { useRef, useState, useTransition } from "react";
import { removeGearListAction, saveGearListAction } from "@/lib/server/actions";
import type { GearListMeta } from "@/lib/server/db";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SavedOverlay, { useSavedFlash } from "@/components/admin/SavedOverlay";

const MAX_PDF_BYTES = 4 * 1024 * 1024;

// Same pill buttons and type as the rest of the admin (e.g. "Add rental product")
const pillBase =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] transition-colors";

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Settings -> Gear list: the PDF behind the "Full gear list" link on the home page. Uploads as soon as a file is chosen. */
export default function GearListSettings({ currentUrl, meta }: { currentUrl: string; meta: GearListMeta | null }) {
  const [saved, flashSaved] = useSavedFlash();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = (file: File) => {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError(`This PDF is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please compress it to under 4MB and try again.`);
      return;
    }
    const formData = new FormData();
    formData.set("gearList", file);
    startTransition(async () => {
      const result = await saveGearListAction(formData);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      else flashSaved();
    });
  };

  const remove = () => {
    setConfirmRemove(false);
    setError(null);
    startTransition(async () => {
      const result = await removeGearListAction();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      else flashSaved();
    });
  };

  return (
    <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm shadow-ink/5">
      <h2 className="text-lg font-bold text-ink">Full gear list</h2>
      <p className="mt-1 text-sm text-ink/70">
        The PDF visitors download from the &ldquo;Full gear list&rdquo; link on the home page.
      </p>

      {currentUrl ? (
        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl bg-smoke px-5 py-4">
          <PdfIcon />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{meta ? meta.name : "Gear-List.pdf"}</p>
            <p className="text-xs text-ash">
              {meta
                ? `PDF · ${formatSize(meta.size)} · Updated ${formatDate(meta.updatedAt)}`
                : "PDF · The file that came with the website"}
            </p>
          </div>
          <a href={currentUrl} target="_blank" rel="noopener noreferrer" className={`${pillBase} border border-ash/30 bg-white text-ink hover:border-ink`}>
            <EyeIcon />
            View PDF
          </a>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmRemove(true)}
            className={`${pillBase} border border-ash/30 bg-white text-ink hover:border-red-600 hover:text-red-600 disabled:opacity-50`}
          >
            <TrashIcon />
            Remove
          </button>
        </div>
      ) : null}

      <div className={`${currentUrl ? "mt-4" : "mt-5"} flex flex-wrap items-center gap-4 rounded-2xl border border-ash/25 px-5 py-4`}>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) upload(file);
          }}
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-signal px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          <UploadIcon />
          {isPending ? "Uploading..." : currentUrl ? "Replace PDF File" : "Choose PDF File"}
        </button>
        <span className="font-mono text-xs text-ash">PDF only · Max 4MB. It goes live as soon as it is uploaded.</span>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <SavedOverlay show={saved} />

      {confirmRemove && (
        <ConfirmDialog
          title="Remove this PDF?"
          message={"The \"Full gear list\" link will disappear from the home page until you upload a new PDF."}
          confirmLabel="Remove"
          onConfirm={remove}
          onCancel={() => setConfirmRemove(false)}
        />
      )}
    </div>
  );
}

function PdfIcon() {
  return (
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none" aria-hidden>
      <path d="M6 2h20l10 10v32a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="#fff" stroke="#d9534f" strokeWidth="2" />
      <path d="M26 2v10h10" stroke="#d9534f" strokeWidth="2" />
      <rect x="2" y="24" width="28" height="13" rx="2" fill="#d9534f" />
      <text x="16" y="34" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="sans-serif">PDF</text>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </svg>
  );
}
