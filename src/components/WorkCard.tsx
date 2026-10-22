"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { WorkItem } from "@/lib/data";

export default function WorkCard({ item }: { item: WorkItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/our-work/${item.id}`} className="flex flex-col">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`group relative overflow-hidden bg-charcoal ${
          item.orientation === "portrait" ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        {/* focus-lock corner brackets echoing hero HUD */}
        {["left-2 top-2 border-l border-t", "right-2 top-2 border-r border-t", "bottom-2 left-2 border-b border-l", "bottom-2 right-2 border-b border-r"].map((pos) => (
          <span
            key={pos}
            className={`pointer-events-none absolute z-20 h-4 w-4 border-signal transition-opacity duration-300 ${pos} ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className={`object-cover transition-transform duration-700 ease-out ${
            hovered ? "scale-110" : "scale-100"
          }`}
        />

      </div>

      <div className="mt-2 flex items-center justify-between gap-3 px-1">
        <span className="font-display text-sm font-bold uppercase tracking-tight">
          {item.title}
        </span>
        <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/70"
            >
              {tag}
            </span>
          ))}
        </span>
      </div>
    </Link>
  );
}
