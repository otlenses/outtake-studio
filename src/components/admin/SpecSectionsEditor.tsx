"use client";

import { useRef, useState } from "react";

export type SpecSection = { title: string; items: string[] };

type Section = SpecSection & { uid: number };

const DEFAULT_TITLES = ["What's Included", "Battery", "Lens Control"];

export default function SpecSectionsEditor({
  name,
  initial,
  suggestions = DEFAULT_TITLES,
}: {
  name: string;
  initial?: SpecSection[];
  suggestions?: string[];
}) {
  const nextUid = useRef(0);
  const [sections, setSections] = useState<Section[]>(() =>
    (initial ?? []).map((s) => ({ ...s, uid: nextUid.current++ }))
  );
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [renaming, setRenaming] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const usedTitles = new Set(sections.map((s) => s.title));
  const availableDefaults = suggestions.filter((t) => !usedTitles.has(t));

  const patch = (uid: number, change: Partial<SpecSection>) =>
    setSections((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...change } : s)));
  const remove = (uid: number) => setSections((prev) => prev.filter((s) => s.uid !== uid));
  const toggle = (uid: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });

  const addSection = (title: string) => {
    const t = title.trim();
    if (!t) return;
    const uid = nextUid.current++;
    setSections((prev) => [...prev, { uid, title: t, items: [""] }]);
    setOpen((prev) => new Set(prev).add(uid));
    setNewTitle("");
    setAdding(false);
  };

  const serialized = sections.map(({ title, items }) => ({
    title,
    items: items.map((i) => i.trim()).filter(Boolean),
  }));

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(serialized)} readOnly />

      {sections.length > 0 && (
        <div className="divide-y divide-ash/15 overflow-hidden rounded-xl border border-ash/25">
          {sections.map((section) => {
            const isOpen = open.has(section.uid);
            const count = section.items.filter((i) => i.trim()).length;
            return (
              <div key={section.uid}>
                <div className="flex items-center gap-1 pr-2">
                  {renaming === section.uid ? (
                    <input
                      type="text"
                      autoFocus
                      value={section.title}
                      onChange={(e) => patch(section.uid, { title: e.target.value })}
                      onBlur={() => setRenaming(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setRenaming(null);
                        }
                      }}
                      className="m-2 min-w-0 flex-1 rounded-lg border border-ink px-3 py-1.5 text-sm font-semibold outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggle(section.uid)}
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-smoke/60"
                    >
                      <span className={`text-ash transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                        {section.title || "Untitled section"}
                      </span>
                      <span className="shrink-0 text-xs text-ash">
                        {count} item{count === 1 ? "" : "s"}
                      </span>
                    </button>
                  )}
                  <SmallButton label="Rename section" onClick={() => setRenaming(section.uid)}>
                    <PencilIcon />
                  </SmallButton>
                  <SmallButton label="Delete section" danger onClick={() => remove(section.uid)}>
                    ×
                  </SmallButton>
                </div>
                {isOpen && (
                  <div className="flex flex-col gap-3 bg-smoke/40 px-4 pb-4 pt-3">
                    <textarea
                      rows={6}
                      value={section.items.join("\n")}
                      onChange={(e) => patch(section.uid, { items: e.target.value.split("\n") })}
                      placeholder="One item per line"
                      className="w-full resize-y rounded-lg border border-ash/30 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3">
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full border border-dashed border-ash/40 px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-ink"
          >
            + Add specification section
          </button>
        ) : (
          <div className="flex flex-col gap-2 rounded-xl border border-ash/25 p-3">
            {availableDefaults.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableDefaults.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addSection(t)}
                    className="rounded-full border border-ash/30 px-3 py-1 text-xs text-ink transition-colors hover:border-ink"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSection(newTitle);
                  }
                }}
                placeholder="New section name"
                className="min-w-0 flex-1 rounded-lg border border-ash/30 px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <button
                type="button"
                onClick={() => addSection(newTitle)}
                disabled={!newTitle.trim()}
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setNewTitle("");
                }}
                className="rounded-full px-3 py-1.5 text-xs text-ash hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SmallButton({
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

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
