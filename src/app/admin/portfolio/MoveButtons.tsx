"use client";

import { useTransition } from "react";
import { movePortfolioProjectAction } from "@/lib/server/actions";
import { ArrowDownIcon, ArrowUpIcon } from "@/components/admin/icons";

export default function MoveButtons({
  id,
  disableUp,
  disableDown,
}: {
  id: string;
  disableUp: boolean;
  disableDown: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Move up"
        disabled={disableUp || isPending}
        onClick={() => startTransition(() => movePortfolioProjectAction(id, "up"))}
        className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-smoke disabled:opacity-30"
      >
        <ArrowUpIcon />
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={disableDown || isPending}
        onClick={() => startTransition(() => movePortfolioProjectAction(id, "down"))}
        className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-smoke disabled:opacity-30"
      >
        <ArrowDownIcon />
      </button>
    </div>
  );
}
