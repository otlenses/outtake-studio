"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

function snapshot(form: HTMLFormElement): string {
  const parts: string[] = [];
  for (const el of Array.from(form.elements)) {
    const f = el as HTMLInputElement;
    if (!f.name) continue;
    if (f.type === "file") {
      parts.push(`${f.name}:${Array.from(f.files ?? []).map((x) => `${x.name}/${x.size}/${x.lastModified}`).join(",")}`);
    } else if (f.type === "checkbox" || f.type === "radio") {
      parts.push(`${f.name}:${f.value}:${f.checked}`);
    } else {
      parts.push(`${f.name}:${f.value}`);
    }
  }
  return parts.join("|");
}

/**
 * Tells whether a form differs from how it looked when it loaded (or was last saved).
 * `resetKey` should change whenever fresh server data arrives (e.g. the `initial` prop),
 * which re-baselines the form. `markClean` re-baselines right after a save.
 */
export default function useFormDirty(formRef: RefObject<HTMLFormElement | null>, resetKey?: unknown) {
  const base = useRef<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const check = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const now = snapshot(form);
    if (base.current === null) base.current = now;
    setDirty(now !== base.current);
  }, [formRef]);

  // Re-baseline when new server data arrives
  useEffect(() => {
    base.current = null;
    check();
  }, [resetKey, check]);

  // Re-check after every render (state-driven fields) and on every edit (uncontrolled fields)
  useEffect(() => {
    check();
  });
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    form.addEventListener("input", check);
    form.addEventListener("change", check);
    return () => {
      form.removeEventListener("input", check);
      form.removeEventListener("change", check);
    };
  }, [formRef, check]);

  const markClean = useCallback(() => {
    // wait for the form to settle after the save / server refresh
    window.setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      base.current = snapshot(form);
      setDirty(false);
    }, 700);
  }, [formRef]);

  return { dirty, markClean };
}
