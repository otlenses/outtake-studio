"use client";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink/70">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-signal py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-transform hover:scale-[1.02]"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-ash/40 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
