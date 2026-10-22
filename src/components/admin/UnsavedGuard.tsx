"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * While `dirty`, warns before the user leaves: the browser's own prompt for reload / close tab,
 * and a "Leave without saving?" dialog for in-app links (sidebar, Cancel, Back…).
 */
export default function UnsavedGuard({ dirty }: { dirty: boolean }) {
  const router = useRouter();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      setTarget(url.pathname + url.search + url.hash);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  if (!target) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <h2 className="text-lg font-bold text-ink">Leave without saving?</h2>
        <p className="mt-2 text-sm text-ink/70">You have changes that haven&apos;t been saved.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => {
              const to = target;
              setTarget(null);
              router.push(to);
            }}
            className="flex-1 rounded-full bg-signal py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
          >
            Leave
          </button>
          <button
            type="button"
            onClick={() => setTarget(null)}
            className="flex-1 rounded-full border border-ash/40 py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-colors hover:border-ink"
          >
            Stay
          </button>
        </div>
      </div>
    </div>
  );
}
