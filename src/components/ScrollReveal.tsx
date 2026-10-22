"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveal-on-scroll wrapper.
 *
 * Progressive enhancement: content renders fully visible by default (SSR and
 * any client where JS fails to run). The hide/animate behaviour is only armed
 * once we've confirmed JS is alive AND the element starts below the fold, so a
 * section can never get stuck at opacity:0.
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "armed" | "revealed">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Already on screen at load — leave it visible, no animation, no flash.
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight) return;

    setState("armed");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);

    // Safety net: never leave content hidden if the observer never fires.
    const fallback = window.setTimeout(() => setState("revealed"), 1500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const hidden = state === "armed";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        hidden ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
