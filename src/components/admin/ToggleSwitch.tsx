"use client";

import { useState, useTransition } from "react";

export default function ToggleSwitch({
  id,
  initialEnabled,
  action,
  onChange,
}: {
  id: string;
  initialEnabled: boolean;
  action: (id: string, enabled: boolean) => Promise<unknown>;
  /** Called right away with the new value (e.g. to update a label) */
  onChange?: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [touched, setTouched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !enabled;
    setEnabled(next);
    onChange?.(next);
    setTouched(true);
    e.currentTarget.closest("[data-off]")?.setAttribute("data-off", String(!next));
    startTransition(async () => {
      await action(id, next);
    });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? "Enabled — click to hide" : "Hidden — click to show"}
      data-on={enabled}
      disabled={isPending}
      onClick={toggle}
      className={`t-toggle relative flex h-6 w-11 shrink-0 items-center rounded-full disabled:opacity-60 ${touched ? "is-init" : ""} ${
        enabled ? "bg-emerald-500" : "bg-ash/30"
      }`}
    >
      <span className="t-toggle-thumb absolute left-[3px] rounded-full bg-white shadow" style={{ height: "18px", width: "18px" }} />
    </button>
  );
}
