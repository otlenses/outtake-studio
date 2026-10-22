"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One editable input per row, with move up/down and remove. Controlled core
 * (`RowList`) plus a form-field wrapper (`RowListEditor`) that posts the rows
 * as newline-separated text, matching the existing `linesToArray` server parsing.
 */
export function RowList({
  items,
  onChange,
  max,
  addLabel,
  placeholder,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  max?: number;
  addLabel: string;
  placeholder?: string;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const focusIndex = useRef<number | null>(null);
  const atMax = max !== undefined && items.length >= max;

  useEffect(() => {
    if (focusIndex.current !== null) {
      inputs.current[focusIndex.current]?.focus();
      focusIndex.current = null;
    }
  });

  const update = (i: number, value: string) => onChange(items.map((v, idx) => (idx === i ? value : v)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const addAfter = (i: number) => {
    if (atMax) return;
    const next = [...items];
    next.splice(i + 1, 0, "");
    focusIndex.current = i + 1;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((value, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAfter(i);
              }
            }}
            className="min-w-0 flex-1 rounded-lg border border-ash/30 px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <IconButton label="Remove" onClick={() => remove(i)} danger>
            ×
          </IconButton>
        </div>
      ))}
      {!atMax && (
        <button
          type="button"
          onClick={() => addAfter(items.length - 1)}
          className="self-start rounded-full border border-dashed border-ash/40 px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-ink"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base text-ash transition-colors disabled:opacity-25 ${
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-smoke hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function RowListEditor({
  name,
  initial,
  max,
  addLabel,
  placeholder,
}: {
  name: string;
  initial?: string[];
  max?: number;
  addLabel: string;
  placeholder?: string;
}) {
  const [items, setItems] = useState<string[]>(() => {
    const start = initial ?? [];
    return max !== undefined ? start.slice(0, max) : start;
  });
  return (
    <>
      <input
        type="hidden"
        name={name}
        value={items.map((v) => v.trim()).filter(Boolean).join("\n")}
        readOnly
      />
      <RowList items={items} onChange={setItems} max={max} addLabel={addLabel} placeholder={placeholder} />
    </>
  );
}
