"use client";

import { useState } from "react";

/** Switch that posts `name=on` only while it is on (matches checkbox-style server parsing). */
export default function FormToggle({
  name,
  label,
  help,
  checked,
  onChange,
  disabled,
}: {
  name: string;
  label: string;
  help?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  const on = checked && !disabled;
  const [touched, setTouched] = useState(false);
  return (
    <div className={`flex items-center justify-between gap-4 ${disabled ? "opacity-50" : ""}`}>
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {help && <p className="text-xs text-ash">{help}</p>}
      </div>
      {on && <input type="hidden" name={name} value="on" />}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={disabled}
        data-on={on}
        onClick={() => {
          setTouched(true);
          onChange(!checked);
        }}
        className={`t-toggle relative flex h-6 w-11 shrink-0 items-center rounded-full ${touched ? "is-init" : ""} ${
          on ? "bg-emerald-500" : "bg-ash/30"
        }`}
      >
        <span className="t-toggle-thumb absolute left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow" />
      </button>
    </div>
  );
}
