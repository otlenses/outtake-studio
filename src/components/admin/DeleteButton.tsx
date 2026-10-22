"use client";

import { useState, useTransition } from "react";
import { TrashIcon } from "./icons";
import ConfirmDialog from "./ConfirmDialog";

export default function DeleteButton({
  action,
  id,
  confirmMessage,
}: {
  action: (id: string) => Promise<void>;
  id: string;
  confirmMessage: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setShowConfirm(true)}
        aria-label="Delete"
        className="flex items-center gap-1 font-mono text-[11px] text-red-600 transition-colors hover:text-red-800 disabled:opacity-50"
      >
        <TrashIcon />
        {isPending ? "Deleting..." : "Delete"}
      </button>

      {showConfirm && (
        <ConfirmDialog
          title="Delete this?"
          message={confirmMessage}
          confirmLabel="Yes, delete"
          onConfirm={() => {
            setShowConfirm(false);
            startTransition(() => action(id));
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
