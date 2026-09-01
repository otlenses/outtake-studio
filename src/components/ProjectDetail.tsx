"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { WorkItem } from "@/lib/data";

export default function ProjectDetail({ item }: { item: WorkItem }) {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-[max(1.5rem,4vw)] py-10 md:py-14">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-signal"
      >
        <BackIcon />
        Back
      </button>

      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/25 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-5xl">
          {item.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 font-mono text-xs uppercase tracking-[0.1em] text-white/50">
          {item.client && (
            <p>
              Client <span className="ml-2 text-white/80">{item.client}</span>
            </p>
          )}
          {item.year && (
            <p>
              Year <span className="ml-2 text-white/80">{item.year}</span>
            </p>
          )}
        </div>
      </div>

      {item.embedUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-charcoal">
          <iframe
            src={item.embedUrl}
            title={item.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-charcoal font-mono text-sm text-white/40">
          Video coming soon
        </div>
      )}

      <div className="mt-12 flex items-center justify-between border-t border-white/12 pt-8">
        <Link
          href="/our-work"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-signal"
        >
          ← Back to Our Work
        </Link>
        <Link
          href="/contact"
          className="rounded-full bg-signal px-6 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-transform hover:scale-[1.02]"
        >
          Start a Project
        </Link>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
