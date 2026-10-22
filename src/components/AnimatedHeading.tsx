"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

/**
 * Big-heading letter animation: each letter slides up into view as the heading
 * scrolls on screen. Same progressive-enhancement rule as ScrollReveal — the text
 * is fully visible by default and only hidden once JS confirms it is below the
 * fold, so it can never get stuck invisible. Skipped for reduced-motion users.
 */
export default function AnimatedHeading({
  as: Tag = "h2",
  text,
  className = "",
  stagger = 35,
  style,
}: {
  as?: ElementType;
  text: string;
  className?: string;
  stagger?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"static" | "armed" | "revealed">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = (observer?: IntersectionObserver) => {
      setState("revealed");
      observer?.disconnect();
    };

    // On screen at load: play once right away instead of waiting for a scroll.
    const onScreen = el.getBoundingClientRect().top <= window.innerHeight;
    setState("armed");
    if (onScreen) {
      const t = window.setTimeout(() => setState("revealed"), 80);
      return () => window.clearTimeout(t);
    }

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && reveal(observer),
      { threshold: 0.2 }
    );
    observer.observe(el);
    const fallback = window.setTimeout(() => reveal(observer), 2500);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const hidden = state === "armed";
  let letterIndex = 0;

  return (
    <Tag ref={ref} aria-label={text} className={className} style={style}>
      {text.split(" ").map((word, w, words) => (
        <span key={w} aria-hidden>
          <span className="inline-block whitespace-nowrap">
            {word.split("").map((ch, i) => {
              const delay = letterIndex++ * stagger;
              return (
                <span
                  key={i}
                  className="inline-block transition-[opacity,transform] duration-700 ease-out"
                  style={{
                    opacity: hidden ? 0 : 1,
                    transform: hidden ? "translateY(0.35em)" : "translateY(0)",
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
          {w < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
