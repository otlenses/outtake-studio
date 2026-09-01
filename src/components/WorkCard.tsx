"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { WorkItem } from "@/lib/data";

export default function WorkCard({ item }: { item: WorkItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleEnter = () => {
    setHovered(true);
    videoRef.current?.play().catch(() => {});
  };
  const handleLeave = () => {
    setHovered(false);
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  return (
    <Link href={`/our-work/${item.id}`} className="flex flex-col">
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={`group relative overflow-hidden bg-charcoal ${
          item.orientation === "portrait" ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        {/* focus-lock corner brackets echoing hero HUD */}
        <span
          className={`pointer-events-none absolute left-2 top-2 z-10 h-4 w-4 border-l border-t border-signal transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />
        <span
          className={`pointer-events-none absolute right-2 top-2 z-10 h-4 w-4 border-r border-t border-signal transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />
        <span
          className={`pointer-events-none absolute bottom-2 left-2 z-10 h-4 w-4 border-b border-l border-signal transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />
        <span
          className={`pointer-events-none absolute bottom-2 right-2 z-10 h-4 w-4 border-b border-r border-signal transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`relative h-full w-full transition-transform duration-500 ease-out ${
            hovered ? "scale-90" : "scale-100"
          }`}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className={`object-cover transition-opacity duration-300 ${
              item.video && hovered ? "opacity-0" : "opacity-100"
            }`}
          />
          {item.video && (
            <video
              ref={videoRef}
              src={item.video}
              muted
              loop
              playsInline
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
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
